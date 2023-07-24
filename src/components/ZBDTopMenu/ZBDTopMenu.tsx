import { Component } from "solid-js";

import logo from '../../assets/img/zbd/logo-only.svg';
import styles from "./ZBDTopMenu.module.scss";
import { useNavigate } from "@solidjs/router";

const ZBDTopMenu: Component = () => {
  const navigate = useNavigate();

  return (
    <div class={styles.wrapper}>
      <div class={styles.menu}>
        <div class={styles.logo} onClick={() => navigate("/")}>
          <img src={logo} alt="ZBD Logo" />
        </div>
        <div class={styles.menuItem} onClick={() => window.open('https://zbd.gg/')}>
          app
        </div>
        <div class={styles.menuItemSelected} onClick={() => navigate("/")}>
          social
        </div>
        <div class={styles.menuItem} onClick={() => window.open('https://zbd.gg/play')}>
          play
        </div>
        <div class={styles.menuItem} onClick={() => window.open('https://zbd.gg/extensions')}>
          extensions
        </div>
        <div class={styles.menuItem} onClick={() => window.open('https://blog.zbd.gg/')}>
          blog
        </div>
      </div>
      <div class={styles.rightSide}>
        <div class={styles.menuItem} onClick={() => window.open('https://zebedee.io')}>
          business api
        </div>
        <div class={styles.download}>
          <div class={styles.downloadButton} onClick={() => window.open('https://zebedee.onelink.me/hcHi/whlv2876')}>
            download ZBD
          </div>
        </div>
      </div>
    </div>
    
  );
};

export default ZBDTopMenu;
