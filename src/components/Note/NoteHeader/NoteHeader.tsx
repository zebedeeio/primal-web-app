import { Component, createEffect, createSignal, Show } from 'solid-js';
import { PrimalNote } from '../../../types/primal';

import styles from './NoteHeader.module.scss';
import { date } from '../../../lib/dates';
import { nip05Verification, truncateNpub } from '../../../stores/profile';
import { useIntl } from '@cookbook/solid-intl';
import { useToastContext } from '../../Toaster/Toaster';
import VerificationCheck from '../../VerificationCheck/VerificationCheck';
import Avatar from '../../Avatar/Avatar';
import { A } from '@solidjs/router';
import { toast as tToast, actions as tActions } from '../../../translations';

const NoteHeader: Component<{ note: PrimalNote}> = (props) => {

  const intl = useIntl();
  const toaster = useToastContext();

  const [showContext, setContext] = createSignal(false);

  const authorName = () => {
    return props.note.user?.displayName ||
      props.note.user?.name ||
      truncateNpub(props.note.user.npub);
  };

  const openContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    setContext(true);
  };

  const copyNostrLink = (e: MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(`nostr:${props.note.post.noteId}`);
    setContext(false);
    toaster?.sendSuccess(intl.formatMessage(tToast.noteNostrLinkCoppied));
  };

  const copyPrimalLink = (e: MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(`${window.location.origin}/thread/${props.note.post.noteId}`);
    setContext(false);
    toaster?.sendSuccess(intl.formatMessage(tToast.notePrimalLinkCoppied));
  };

  const onClickOutside = (e: MouseEvent) => {
    if (
      !document?.getElementById(`note_context_${props.note.post.id}`)?.contains(e.target as Node)
    ) {
      setContext(false);
    }
  }

  createEffect(() => {
    if (showContext()) {
      document.addEventListener('click', onClickOutside);
    }
    else {
      document.removeEventListener('click', onClickOutside);
    }
  });

  const isVerifiedByPrimal = () => {
    return !!props.note.user.nip05 &&
      props.note.user.nip05.endsWith('primal.net');
  }

  return (
    <div class={styles.header}>
      <div class={styles.headerInfo}>
        <div
            class={styles.avatar}
            title={props.note?.user?.npub}
          >
            <A
              href={`/profile/${props.note.user.npub}`}
            >
              <Avatar
                src={props.note?.user?.picture}
                size="sm"
                highlightBorder={isVerifiedByPrimal()}
              />
            </A>
          </div>
        <div class={styles.postInfo}>
          <div class={styles.userInfo}>

            <span class={styles.userName}>
              {authorName()}
            </span>

            <VerificationCheck user={props.note.user} />

            <span
              class={styles.time}
              title={date(props.note.post?.created_at).date.toLocaleString()}
            >
              {date(props.note.post?.created_at).label}
            </span>
          </div>

          <Show
            when={props.note.user?.nip05}
          >
            <span
              class={styles.verification}
              title={props.note.user?.nip05}
            >
              {nip05Verification(props.note.user)}
            </span>
          </Show>
        </div>
      </div>
      <div class={styles.contextMenu}>
        <button
          class={styles.contextButton}
          onClick={openContextMenu}
        >
          <div class={styles.contextIcon} ></div>
        </button>
        <Show when={showContext()}>
          <div
            id={`note_context_${props.note.post.id}`}
            class={styles.contextMenuOptions}
          >
            <button
              onClick={copyNostrLink}
              class={styles.contextOption}
            >
              {intl.formatMessage(tActions.noteCopyNostrLink)}
            </button>
            <button
              onClick={copyPrimalLink}
              class={styles.contextOption}
            >
              {intl.formatMessage(tActions.noteCopyPrimalLink)}
            </button>
          </div>
        </Show>
      </div>
    </div>
  )
}

export default NoteHeader;
