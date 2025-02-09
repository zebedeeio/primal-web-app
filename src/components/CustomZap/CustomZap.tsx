import { useIntl } from '@cookbook/solid-intl';
import { Component, createEffect, createSignal, For } from 'solid-js';
import { useAccountContext } from '../../contexts/AccountContext';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { zapNote } from '../../lib/zap';
import { userName } from '../../stores/profile';
import { toastZapFail, zapCustomOption } from '../../translations';
import { PrimalNote } from '../../types/primal';
import { debounce } from '../../utils';
import Modal from '../Modal/Modal';
import { useToastContext } from '../Toaster/Toaster';

import styles from './CustomZap.module.scss';

const CustomZap: Component<{
  open?: boolean,
  note: PrimalNote,
  onConfirm: (amount?: number) => void,
  onSuccess: (amount?: number) => void,
  onFail: (amount?: number) => void
}> = (props) => {

  const toast = useToastContext();
  const account = useAccountContext();
  const intl = useIntl();
  const settings = useSettingsContext();

  const [selectedValue, setSelectedValue] = createSignal(settings?.availableZapOptions[0] || 10);

  createEffect(() => {
    setSelectedValue(settings?.availableZapOptions[0] || 10)
  });

  const isSelected = (value: number) => value === selectedValue();

  let comment = '';

  const setComment = (e: InputEvent) => {
    debounce(() => {
      const target = e.target as HTMLInputElement;
      comment = target.value;
    }, 500);
  };

  const truncateNumber = (amount: number) => {
    const t = 1000;

    if (amount < t) {
      return `${amount}`;
    }

    if (amount < Math.pow(t, 2)) {
      return (amount % t === 0) ?
        `${Math.floor(amount / t)}K` :
        intl.formatNumber(amount);
    }

    if (amount < Math.pow(t, 3)) {
      return (amount % t === 0) ?
        `${Math.floor(amount / Math.pow(t, 2))}M` :
        intl.formatNumber(amount);
    }

    if (amount < Math.pow(t, 4)) {
      return (amount % t === 0) ?
        `${Math.floor(amount / Math.pow(t, 3))}B` :
        intl.formatNumber(amount);
    }

    if (amount < Math.pow(t, 5)) {
      return (amount % t === 0) ?
        `${Math.floor(amount / Math.pow(t, 3))}T` :
        intl.formatNumber(amount);
    }

    return intl.formatNumber(amount);
  };

  const submit = async () => {
    if (account?.hasPublicKey()) {
      props.onConfirm(selectedValue());
      const success = await zapNote(props.note, account.publicKey, selectedValue(), comment, account.relays);

      if (success) {
        props.onSuccess(selectedValue());
        return;
      }

      toast?.sendWarning(
        intl.formatMessage(toastZapFail),
      );

      props.onFail(selectedValue())
    }
  };

  return (
    <Modal open={props.open}>
      <div class={styles.customZap}>
        <div class={styles.header}>
          <div class={styles.title}>
            <div class={styles.zapIcon}></div>
            <div class={styles.caption}>
              {intl.formatMessage(zapCustomOption,{
                user: userName(props.note.user),
              })}
              <span class={styles.amount}>
                {truncateNumber(selectedValue())}
              </span> <span class={styles.units}>sats</span>
            </div>
          </div>
          <button class={styles.close} onClick={() => props.onFail(0)}>
          </button>
        </div>

        <div class={styles.options}>
          <For each={settings?.availableZapOptions}>
            {(value) =>
              <button
                class={`${styles.zapOption} ${isSelected(value) ? styles.selected : ''}`}
                onClick={() => setSelectedValue(value)}
              >
                {truncateNumber(value)}
              </button>
            }
          </For>
        </div>

        <input
          type="text"
          class={styles.comment}
          value={comment}
          placeholder={'Comment'}
          onInput={setComment}
        />

        <button
          class={styles.action}
          onClick={submit}
        >
          <div class={styles.caption}>
              {intl.formatMessage(zapCustomOption,{
                user: userName(props.note.user),
              })}
            <span class={styles.amount}>
              {truncateNumber(selectedValue())}
            </span> <span class={styles.units}>sats</span>
          </div>
        </button>

      </div>
    </Modal>
  );
}

export default CustomZap;
