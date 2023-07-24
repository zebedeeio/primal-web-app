import { Component, createSignal } from "solid-js";

import logo from '../../assets/img/zbd/logo-only.svg';
import menu from '../../assets/icons/align_left.svg';
import download from '../../assets/icons/download_app.svg';
import downloadDark from '../../assets/icons/download_app_dark.svg';
import menuClose from '../../assets/icons/close_menu.svg';
import styles from "./ZBDTopMenu.module.scss";
import { useNavigate } from "@solidjs/router";

const ZBDTopMenu: Component = () => {
  const [showMenu, setShowMenu] = createSignal(false);
  const navigate = useNavigate();

  return (
    <div class={styles.wrapper}>
      {/* Mobile */}
      {showMenu() && (
        <div class={styles.mobileMenu}>
          {showMenu() && (
            <div onClick={() => setShowMenu(false)}>
              <img src={menuClose} alt="ZBD Menu CLOSE" class={styles.menuClose} />
            </div>
          )}
          <div class={styles.logoMobile} onClick={() => navigate("/")}>
            <img src={logo} alt="ZBD Logo" />
          </div>
          <div class={styles.downloadMobileWrapper} onClick={() => window.open('https://zebedee.onelink.me/hcHi/whlv2876')}>
            <img src={downloadDark} alt="ZBD Download" />
            <span>download ZBD app</span>
          </div>
          <div class={styles.mobileMenuListWrapper}>
            <div class={styles.mobileMenuListItem} style='opacity: 0.5;' onClick={() => {
              setShowMenu(false);
              navigate("/");
            }}>
              social
            </div>
            <div class={styles.mobileMenuListItem} onClick={() => window.open('https://zbd.gg/play/')}>
              play
            </div>
            <div class={styles.mobileMenuListItem} onClick={() => window.open('https://zbd.gg/')}>
              about
            </div>
            <div class={styles.mobileMenuListItem} onClick={() => window.open('https://zbd.gg/extensions/')}>
              extensions
            </div>
            <div class={styles.mobileMenuListItem} onClick={() => window.open('https://blog.zebedee.io/')}>
              blog
            </div>
            <div class={styles.separator} />
            <div class={styles.mobileMenuListItem} onClick={() => window.open('https://blog.zebedee.io/')}>
              developer api
            </div>
          </div>
        </div>
      )}
      <div class={styles.mobileTopHeader}>
        <div class={styles.mobileMenuTrigger} onClick={() => setShowMenu(true)}>
          <img src={menu} alt="ZBD Menu" class={styles.menuTrigger} />
        </div>
        <div class={styles.secondaryLogoMobile} onClick={() => navigate("/")}>
          <img src={logo} alt="ZBD Logo" />
        </div>
        <div class={styles.downloadAppMobile} onClick={() => window.open('https://zebedee.onelink.me/hcHi/whlv2876')}>
          <img src={download} alt="ZBD Download" />
        </div>
      </div>
      {/* Desktop */}
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
        <div class={styles.menuItem} onClick={() => window.open('https://blog.zebedee.io/')}>
          blog
        </div>
      </div>
      <div class={styles.rightSide}>
        <div class={styles.menuItem} onClick={() => window.open('https://zebedee.io')}>
          developer api
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
