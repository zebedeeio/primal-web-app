import { Component } from "solid-js";

import styles from "./ZBDTopMenu.module.scss";
import { useNavigate } from "@solidjs/router";

const ZBDTopMenu: Component<{ small: boolean; isHome?: boolean }> = (props) => {
  const navigate = useNavigate();

  return (
    <div class={styles.wrapper}>
      <div class={styles.menu}>
        <div class={styles.menuItem} onClick={() => window.open('https://zbd.gg/')}>
          ZBD App
        </div>
        <div class={styles.menuItemSelected} onClick={() => window.open('https://zbd.gg/')}>
          Social
        </div>
        <div class={styles.menuItem} onClick={() => window.open('https://zbd.gg/play')}>
          Games
        </div>
        <div class={styles.menuItem} onClick={() => window.open('https://zbd.gg/extensions')}>
          Extensions
        </div>
      </div>
      <div class={styles.download}>
        <div class={styles.downloadButton} onClick={() => window.open('https://zbd.gg/')}>
          Download ZBD
        </div>
      </div>
    </div>
  );
};

export default ZBDTopMenu;
