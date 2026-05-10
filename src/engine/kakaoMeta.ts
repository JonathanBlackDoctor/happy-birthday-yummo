/**
 * KAKAO 명령의 메타 정보 자동 도출.
 * - 모드 추론(senders.size > 2 → group, else dm)
 * - 메시지별 시각 (시작 시각 + 누적 delay)
 * - 메시지별 안 읽은 수 (단톡일 때만)
 *
 * KAKAO 명령에 mode/roomMembers/startHour 등이 명시되면 그것 우선, 없으면 자동.
 */

import type { KakaoMessage, SceneCommand } from './types';
import { isSelfSender } from '@/data/kakaoProfiles';

type KakaoCommand = Extract<SceneCommand, { type: 'KAKAO' }>;

export interface MessageMeta {
  time: string; // "오후 8:30"
  unreadCount: number; // 0이면 표시 X
}

const PER_MESSAGE_GAP_MIN = 1;

function inferMode(cmd: KakaoCommand): 'dm' | 'group' {
  if (cmd.mode) return cmd.mode;
  const senders = new Set(cmd.messages.map((m) => m.sender));
  return senders.size > 2 ? 'group' : 'dm';
}

function inferRoomMembers(cmd: KakaoCommand, mode: 'dm' | 'group'): number {
  if (cmd.roomMembers) return cmd.roomMembers;
  if (mode === 'dm') return 2;
  const senders = new Set(cmd.messages.map((m) => m.sender));
  return Math.max(senders.size, 3);
}

function formatTime(hour: number, minute: number): string {
  const period = hour < 12 ? '오전' : '오후';
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  const mm = String(minute).padStart(2, '0');
  return `${period} ${h12}:${mm}`;
}

export function deriveKakaoMeta(cmd: KakaoCommand): {
  mode: 'dm' | 'group';
  roomMembers: number;
  metas: MessageMeta[];
} {
  const mode = inferMode(cmd);
  const roomMembers = inferRoomMembers(cmd, mode);
  const startHour = cmd.startHour ?? 20;
  const startMinute = cmd.startMinute ?? 0;

  let curMin = startHour * 60 + startMinute;
  const times: string[] = [];
  for (let i = 0; i < cmd.messages.length; i++) {
    if (i > 0) curMin += PER_MESSAGE_GAP_MIN;
    const h = Math.floor(curMin / 60) % 24;
    const m = curMin % 60;
    times.push(formatTime(h, m));
  }

  const unreadCounts = computeUnreadCounts(cmd.messages, mode, roomMembers);

  const metas: MessageMeta[] = cmd.messages.map((_, i) => ({
    time: times[i],
    unreadCount: unreadCounts[i],
  }));

  return { mode, roomMembers, metas };
}

/**
 * 안 읽은 수 룰:
 * - dm: 메시지 i 이후로 상대(yunmo가 아닌)가 한 번이라도 응답하면 본인 메시지(yunmo)는 읽힘.
 *       반대도 동일. 응답 없으면 unread=1.
 * - group: 메시지 i 이후로 발신한 unique sender 수만큼 읽음 처리.
 *          unread = max(0, roomMembers - 1 - 이후 unique senders 수)
 *          (i 자신의 sender 제외, 본인은 항상 읽은 걸로 가정)
 */
function computeUnreadCounts(
  messages: KakaoMessage[],
  mode: 'dm' | 'group',
  roomMembers: number,
): number[] {
  const N = messages.length;
  const result: number[] = new Array(N).fill(0);

  for (let i = 0; i < N; i++) {
    const sender = messages[i].sender;
    const subsequentSenders = new Set<string>();
    for (let j = i + 1; j < N; j++) {
      if (messages[j].sender !== sender) subsequentSenders.add(messages[j].sender);
    }

    if (mode === 'dm') {
      const opponentResponded = [...subsequentSenders].some((s) =>
        isSelfSender(sender) ? !isSelfSender(s) : isSelfSender(s),
      );
      result[i] = opponentResponded ? 0 : 1;
    } else {
      // group: 발신자(i 본인)와 yunmo(시청자)는 항상 읽은 상태로 간주
      const readers = new Set<string>([sender]);
      for (const s of subsequentSenders) readers.add(s);
      readers.add('yunmo');
      const unread = Math.max(0, roomMembers - readers.size);
      result[i] = unread;
    }
  }

  return result;
}
