/**
 * 카톡 메시지 버블 — UI-SPEC §6 + COLOR-TOKENS §4.
 *
 * 본인(yunmo) 메시지는 우측, 그 외는 좌측. 좌측 메시지는 발신자 아바타 + 이름.
 * 시각·안읽음 메타는 KakaoModal에서 자동 생성하여 props로 전달.
 */

import { useEffect, useState } from 'react';
import type { KakaoMessage as KakaoMessageType } from '@/engine/types';
import { audioManager } from '@/engine/audioManager';
import { isSelfSender, resolveProfile } from '@/data/kakaoProfiles';

interface Props {
  message: KakaoMessageType;
  delayMs?: number;
  showSenderHeader?: boolean; // 그룹 첫 메시지일 때만 이름·아바타 표시
  time?: string;
  unreadCount?: number;
  /** 안 읽음 카운트가 메시지 등장 후 자동으로 사라지기까지 ms. undefined면 카톡 닫힐 때까지 유지. */
  unreadFadeMs?: number;
  showTime?: boolean; // 그룹 마지막 메시지일 때만 시각 표시
  /** 카톡 씬 첫 메시지 여부 — 첫 메시지에만 알림음(sfx_katalk_notify 0.5x), 이후는 슥(sfx_katalk_send) */
  isFirst?: boolean;
  /** 현재 씬 ID — v2 프로필 분기에 사용 */
  sceneId?: string | null;
  onAppear?: () => void;
}

export function KakaoMessage({
  message,
  delayMs = 0,
  showSenderHeader = true,
  time,
  unreadCount,
  unreadFadeMs,
  showTime = true,
  isFirst = false,
  sceneId,
  onAppear,
}: Props) {
  const [visible, setVisible] = useState(delayMs === 0);
  const [showTyping, setShowTyping] = useState(message.typing && delayMs > 0);
  const [unreadVisible, setUnreadVisible] = useState(true);

  const isSelf = isSelfSender(message.sender);
  const profile = resolveProfile(message.sender, sceneId);

  useEffect(() => {
    const playEnterSfx = () => {
      if (isFirst && !isSelf) {
        // 2026-05-09 PM 정정 #3: 알림음 0.4 → 0.2 (계속 시끄럽다는 PM 후속).
        audioManager.playSfx('sfx_katalk_notify', { volume: 0.2 });
      } else {
        // 2026-05-09 PM 정정 #3: 메세지 전송 SFX 0.3 → 0.1.
        audioManager.playSfx('sfx_katalk_send', { volume: 0.1 });
      }
    };
    if (delayMs === 0) {
      playEnterSfx();
      onAppear?.();
      return;
    }
    const t = setTimeout(() => {
      setShowTyping(false);
      setVisible(true);
      playEnterSfx();
      onAppear?.();
    }, delayMs);
    return () => clearTimeout(t);
  }, [delayMs, isSelf, isFirst, onAppear]);

  // 안 읽음 자동 페이드 — 메시지 등장 후 unreadFadeMs ms 후 카운트 숨김.
  useEffect(() => {
    if (unreadFadeMs === undefined || !visible) return;
    const t = setTimeout(() => setUnreadVisible(false), unreadFadeMs);
    return () => clearTimeout(t);
  }, [unreadFadeMs, visible]);

  const showUnread = unreadVisible && unreadCount !== undefined && unreadCount > 0;

  if (showTyping) {
    return (
      <div className="flex justify-start mb-1">
        <div className="w-8 mr-2" />
        <div
          className="px-3 py-2 rounded-2xl"
          style={{
            background: 'var(--kakao-bubble-other)',
            color: 'var(--kakao-typing-dot)',
            fontSize: 'var(--kakao-font-size)',
            lineHeight: 1.4,
          }}
        >
          입력 중<span className="inline-block animate-pulse">...</span>
        </div>
      </div>
    );
  }

  if (!visible) return null;

  if (isSelf) {
    return (
      <div className="flex justify-end mb-1 px-2">
        <div className="flex items-end gap-1 max-w-[80%]">
          <div className="flex flex-col items-end text-[10px]" style={{ color: 'var(--kakao-timestamp)' }}>
            {showUnread ? (
              <span className="text-yellow-500 font-medium">{unreadCount}</span>
            ) : null}
            {showTime && time ? <span>{time}</span> : null}
          </div>
          {message.image ? (
            <img
              src={message.image}
              alt=""
              className="rounded-2xl max-w-[240px] block"
              style={{ objectFit: 'cover' }}
              loading="lazy"
            />
          ) : (
            <div
              className="px-3 py-2 rounded-2xl break-words"
              style={{
                background: 'var(--kakao-bubble-self)',
                color: 'var(--kakao-text-self)',
                fontSize: 'var(--kakao-font-size)',
                lineHeight: 1.4,
              }}
            >
              {message.text}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-1 px-2">
      <div className="flex items-start gap-2 max-w-[85%]">
        <div className="w-9 flex-shrink-0">
          {showSenderHeader ? (
            <img
              src={profile.avatar}
              alt=""
              className="w-9 h-9 rounded-2xl object-cover"
              loading="lazy"
              onError={(e) => {
                // 자산 부재 시 default1·2·3 중 sender 해시로 폴백 (빈 공간 방지)
                const img = e.currentTarget;
                if (img.dataset.fallback) {
                  img.style.visibility = 'hidden';
                  return;
                }
                const sender = message.sender;
                let h = 0;
                for (let i = 0; i < sender.length; i++) h = (h * 31 + sender.charCodeAt(i)) | 0;
                const idx = Math.abs(h) % 3;
                img.dataset.fallback = '1';
                img.src = `/img/avatar/default${idx + 1}.webp`;
              }}
            />
          ) : null}
        </div>
        <div className="flex flex-col items-start min-w-0">
          {showSenderHeader && (
            <span
              className="mb-0.5"
              style={{ color: 'var(--kakao-timestamp)', fontSize: 'var(--kakao-name-size)' }}
            >
              {profile.name}
            </span>
          )}
          <div className="flex items-end gap-1">
            {message.image ? (
              <img
                src={message.image}
                alt=""
                className="rounded-2xl max-w-[240px] block"
                style={{ objectFit: 'cover' }}
                loading="lazy"
              />
            ) : (
              <div
                className="px-3 py-2 rounded-2xl break-words"
                style={{
                  background: 'var(--kakao-bubble-other)',
                  color: 'var(--kakao-text-other)',
                  fontSize: 'var(--kakao-font-size)',
                  lineHeight: 1.4,
                }}
              >
                {message.text}
              </div>
            )}
            <div className="flex flex-col items-start text-[10px]" style={{ color: 'var(--kakao-timestamp)' }}>
              {showUnread ? (
                <span className="text-yellow-500 font-medium">{unreadCount}</span>
              ) : null}
              {showTime && time ? <span>{time}</span> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
