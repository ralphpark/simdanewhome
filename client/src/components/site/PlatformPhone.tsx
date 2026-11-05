import { useSiteImage } from "@/hooks/useSiteImage";
import { Logo } from "./Logo";
import "./platform-phone.css";

/** The approved home phone, held at its arrival state; no decorative animation. */
export function PlatformPhone() {
  const gift = useSiteImage("home.gift");
  return <div className="sp-phone-demo" role="img" aria-label="simda 플랫폼 — 선물이 도착했습니다.">
        <div className="ph">
          <div className="scr">
            <svg className="pf-map" viewBox="560 150 520 760" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
              <g className="cam1"><g className="cam2">
                <rect className="m-bg" x="-300" y="-300" width="2200" height="1600"></rect>
                <rect className="m-bd" x="474" y="104" width="232" height="182" rx="12"></rect>
                <rect className="m-bd" x="474" y="314" width="110" height="80" rx="10"></rect>
                <rect className="m-bd" x="594" y="314" width="112" height="80" rx="10"></rect>
                <rect className="m-bd" x="474" y="404" width="232" height="92" rx="10"></rect>
                <rect className="m-bd" x="474" y="524" width="232" height="70" rx="10"></rect>
                <rect className="m-bd" x="474" y="604" width="110" height="102" rx="10"></rect>
                <rect className="m-bd" x="594" y="604" width="112" height="102" rx="10"></rect>
                <rect className="m-bd" x="734" y="104" width="110" height="182" rx="12"></rect>
                <rect className="m-bd" x="854" y="104" width="112" height="182" rx="12"></rect>
                <rect className="m-bd" x="734" y="314" width="232" height="64" rx="10"></rect>
                <rect className="m-bd" x="734" y="388" width="104" height="108" rx="10"></rect>
                <rect className="m-bd" x="848" y="388" width="118" height="108" rx="10"></rect>
                <rect className="m-bd" x="734" y="524" width="140" height="90" rx="10"></rect>
                <rect className="m-bd" x="884" y="524" width="82" height="182" rx="10"></rect>
                <rect className="m-bd" x="734" y="624" width="140" height="82" rx="10"></rect>
                <rect className="m-bd" x="994" y="104" width="232" height="182" rx="12"></rect>
                <rect className="m-bd" x="994" y="314" width="110" height="182" rx="10"></rect>
                <rect className="m-bd" x="474" y="734" width="232" height="70" rx="10"></rect>
                <rect className="m-bd" x="734" y="734" width="232" height="70" rx="10"></rect>
                <rect className="m-park" x="994" y="524" width="232" height="182" rx="14"></rect>
                <circle className="m-tree" cx="1030" cy="560" r="14"></circle>
                <circle className="m-tree" cx="1070" cy="600" r="18"></circle>
                <circle className="m-tree" cx="1040" cy="670" r="12"></circle>
                <path className="m-river" d="M-100 900 C 240 830, 480 990, 800 950 S 1300 820, 1700 900"></path>
                <path className="m-st" d="M200 -60V1060M460 -60V1060M980 -60V1060M1240 -60V1060M-60 90H1660M-60 300H1660M-60 720H1660M-60 930H1660"></path>
                <path className="m-main" d="M720 -60V1060M-60 510H1660"></path>
                <path className="m-lane" d="M720 -60V1060M-60 510H1660"></path>
                <circle className="radar" cx="720" cy="510" r="360"></circle>
                <circle className="radar2" cx="720" cy="510" r="200"></circle>
                <g className="sh-dim">
                  <g transform="translate(460 640)"><circle className="sh-base" r="12"></circle><g className="sh-on sh2"><circle className="sh-halo" r="30"></circle><circle className="sh-dot" r="12"></circle></g></g>
                  <g transform="translate(600 300)"><circle className="sh-base" r="12"></circle><g className="sh-on sh3"><circle className="sh-halo" r="30"></circle><circle className="sh-dot" r="12"></circle></g></g>
                  <g transform="translate(850 720)"><circle className="sh-base" r="12"></circle><g className="sh-on sh4"><circle className="sh-halo" r="30"></circle><circle className="sh-dot" r="12"></circle></g></g>
                </g>
                <g transform="translate(1240 200)"><circle className="sh-base" r="12"></circle></g>
                <g transform="translate(560 90)"><circle className="sh-base" r="12"></circle></g>
                <g transform="translate(980 380)">
                  <circle className="sh-base" r="12"></circle>
                  <g className="sh-on sh1"><circle className="sh-halo" r="30"></circle><circle className="sh-dot" r="12"></circle></g>
                  <circle className="sh-gold" r="34"></circle>
                  <circle className="sh-gdot" r="13"></circle>
                </g>
                <g className="tag">
                  <rect className="tag-bg" x="740" y="352" width="210" height="52" rx="26"></rect>
                  <text className="tag-tx" x="845" y="386">동네 꽃집 · 800m</text>
                </g>
                <path className="rt-g" pathLength="1" d="M980 380 V510 H720"></path>
                <path className="rt" pathLength="1" d="M980 380 V510 H720"></path>
                <circle className="pulse" cx="720" cy="510" r="40"></circle>
                <circle className="pulse pulse2" cx="720" cy="510" r="40"></circle>
                <g transform="translate(720 510)">
                  <circle className="hm-glow" r="60"></circle>
                  <circle className="hm-pin" r="30"></circle>
                  <path className="hm-house" d="M-13 2 L0 -11 L13 2 V14 H5 V6 H-5 V14 H-13 Z"></path>
                  <text className="hm-label" y="66">우리 집</text>
                </g>
                <g transform="translate(720 510) rotate(0)"><path className="bs" d="M50 0 C 56 -6 66 -6 72 0 C 66 6 56 6 50 0 Z"></path></g>
                <g transform="translate(720 510) rotate(45)"><path className="bs" d="M50 0 C 56 -6 66 -6 72 0 C 66 6 56 6 50 0 Z"></path></g>
                <g transform="translate(720 510) rotate(90)"><path className="bs" d="M50 0 C 56 -6 66 -6 72 0 C 66 6 56 6 50 0 Z"></path></g>
                <g transform="translate(720 510) rotate(135)"><path className="bs" d="M50 0 C 56 -6 66 -6 72 0 C 66 6 56 6 50 0 Z"></path></g>
                <g transform="translate(720 510) rotate(180)"><path className="bs" d="M50 0 C 56 -6 66 -6 72 0 C 66 6 56 6 50 0 Z"></path></g>
                <g transform="translate(720 510) rotate(225)"><path className="bs" d="M50 0 C 56 -6 66 -6 72 0 C 66 6 56 6 50 0 Z"></path></g>
                <g transform="translate(720 510) rotate(270)"><path className="bs" d="M50 0 C 56 -6 66 -6 72 0 C 66 6 56 6 50 0 Z"></path></g>
                <g transform="translate(720 510) rotate(315)"><path className="bs" d="M50 0 C 56 -6 66 -6 72 0 C 66 6 56 6 50 0 Z"></path></g>
                <g transform="translate(980 352)">
                  <g className="gf-move">
                    <g className="gf-pop">
                      <rect className="gf-sh" x="-22" y="18" width="44" height="8" rx="4"></rect>
                      <rect className="gf-box" x="-20" y="-12" width="40" height="32" rx="5"></rect>
                      <rect className="gf-lid" x="-24" y="-20" width="48" height="11" rx="4"></rect>
                      <rect className="gf-rib" x="-4" y="-20" width="8" height="40"></rect>
                      <path className="gf-leaf" d="M0 -20 C -4 -32 -14 -36 -20 -34 C -18 -26 -10 -20 0 -20 Z M0 -20 C 4 -34 14 -40 22 -38 C 20 -28 10 -21 0 -20 Z"></path>
                    </g>
                  </g>
                </g>
              </g></g>
            </svg>
            <div className="app-top">
              <div className="sb"><span>9:41</span><span className="sb-ic"><i></i><i></i><i></i><b></b></span></div>
              <div className="ab"><Logo aria-hidden="true" /><span>우리 동네 ⌄</span></div>
            </div>
            <div className="island"></div>
            <div className="sheet s4"><img className="sh-big" src={gift.url} alt={gift.alt} /><div className="sh-ok"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M8 12.5l2.5 2.5L16 9.5"></path></svg><p className="sh-t">선물이 도착했습니다.</p></div></div>
          </div>
        </div>
  </div>;
}
