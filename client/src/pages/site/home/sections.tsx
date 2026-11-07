import { Link } from "wouter";
import { useSiteImage } from "@/hooks/useSiteImage";
import { defaultImages } from "@/content/images";
import { HomeWork, HomeClients, HomeMagazine } from "./content";

// Markup and SVG geometry ported from the approved home.dc.html, without canvas code.
export function HomeSections() {
  const hero = useSiteImage("home.hero");
  const care = useSiteImage("home.care");
  const education = useSiteImage("home.education");
  const landscape = useSiteImage("home.landscape");
  const sales = useSiteImage("home.sales");
  const platform = useSiteImage("home.platform");
  const story = useSiteImage("home.story");
  const gift = useSiteImage("home.gift");
  return <div className="home-v2 main">
<svg className="defs" aria-hidden="true">
  <defs>
    <g id="simda-home-lg-emb" fill="currentColor"><path d="M 356.164062 119.144531 C 356.164062 116.777344 357.101562 114.625 358.617188 113.03125 L 366.679688 121.097656 L 356.683594 122.117188 C 356.351562 121.183594 356.164062 120.1875 356.164062 119.144531 M 362.867188 110.542969 L 363.351562 115.289062 L 359.945312 111.882812 C 360.820312 111.265625 361.804688 110.8125 362.867188 110.542969 M 365.050781 110.257812 C 366.984375 110.257812 368.769531 110.886719 370.230469 111.9375 L 370.042969 121.976562 L 365.3125 117.246094 L 364.605469 110.28125 C 364.753906 110.273438 364.898438 110.257812 365.050781 110.257812 M 365.050781 128.027344 C 364.253906 128.027344 363.488281 127.914062 362.753906 127.71875 L 362.304688 123.304688 L 368.28125 122.695312 L 371.164062 125.578125 C 369.566406 127.089844 367.421875 128.027344 365.050781 128.027344 M 371.957031 113.558594 C 373.191406 115.085938 373.9375 117.03125 373.9375 119.144531 C 373.9375 121.042969 373.332031 122.800781 372.3125 124.25 L 371.761719 123.695312 Z M 357.492188 123.796875 L 360.558594 123.484375 L 360.917969 127.003906 C 359.507812 126.261719 358.328125 125.144531 357.492188 123.796875 M 365.050781 130.019531 C 371.046875 130.019531 375.925781 125.140625 375.925781 119.144531 C 375.925781 113.148438 371.046875 108.269531 365.050781 108.269531 C 359.054688 108.269531 354.175781 113.148438 354.175781 119.144531 C 354.175781 125.140625 359.054688 130.019531 365.050781 130.019531"></path></g>
    <g id="simda-home-lg-brk" fill="currentColor"><path d="M 372.925781 188.769531 C 372.925781 189.488281 372.34375 190.078125 371.625 190.078125 L 126.980469 190.078125 C 126.261719 190.078125 125.675781 189.488281 125.675781 188.769531 L 125.675781 150.695312 L 123.070312 150.695312 L 123.070312 188.769531 C 123.070312 190.925781 124.824219 192.679688 126.980469 192.679688 L 371.625 192.679688 C 373.78125 192.679688 375.535156 190.925781 375.535156 188.769531 L 375.535156 150.695312 L 372.925781 150.695312 Z M 372.925781 188.769531"></path></g>
    <g id="simda-home-lg-s" fill="currentColor"><path d="M 143.597656 166.398438 C 143.597656 166.417969 143.597656 166.433594 143.601562 166.449219 L 149.464844 166.449219 C 149.441406 166.433594 149.421875 166.417969 149.402344 166.398438 C 149.359375 166.367188 149.3125 166.332031 149.273438 166.296875 C 147.828125 165.003906 146.921875 163.34375 146.550781 161.324219 C 146.550781 161.320312 146.542969 161.316406 146.542969 161.3125 C 146.460938 160.875 146.40625 160.199219 145.417969 159.574219 C 144.710938 159.128906 143.949219 159.046875 143.574219 159.035156 C 143.425781 159.03125 143.332031 159.035156 143.332031 159.035156 C 143.332031 160.738281 143.375 162.421875 143.464844 164.09375 C 143.507812 164.882812 143.550781 165.648438 143.597656 166.398438"></path><path d="M 147.25 151.109375 C 149.214844 152.8125 151.929688 154.195312 155.394531 155.246094 C 158.152344 156.070312 160.238281 156.992188 161.644531 158.019531 C 163.054688 159.046875 163.757812 160.527344 163.757812 162.464844 C 163.757812 164.070312 163.285156 165.375 162.351562 166.398438 C 162.335938 166.417969 162.324219 166.433594 162.308594 166.449219 L 168.449219 166.449219 C 168.460938 166.433594 168.46875 166.417969 168.480469 166.398438 C 168.859375 165.828125 169.183594 165.226562 169.4375 164.582031 C 169.996094 163.171875 170.273438 161.703125 170.273438 160.179688 C 170.273438 158.359375 169.980469 156.789062 169.394531 155.46875 C 168.804688 154.144531 168 153.03125 166.972656 152.121094 C 165.945312 151.210938 164.714844 150.433594 163.273438 149.792969 C 161.835938 149.140625 160.265625 148.554688 158.5625 148.027344 C 155.394531 147.03125 153.207031 146.015625 152.003906 144.992188 C 150.800781 143.964844 150.199219 142.6875 150.199219 141.160156 C 150.199219 139.457031 150.859375 138.121094 152.179688 137.15625 C 153.5 136.183594 155.011719 135.699219 156.714844 135.699219 C 158.945312 135.699219 160.808594 136.214844 162.304688 137.242188 C 163.507812 138.066406 164.351562 139.339844 164.851562 141.050781 C 164.996094 141.457031 165.328125 142.183594 166.054688 142.707031 C 166.824219 143.257812 167.828125 143.402344 168.3125 143.4375 C 168.492188 143.453125 168.601562 143.453125 168.601562 143.453125 C 168.601562 142.863281 168.585938 142.203125 168.558594 141.46875 C 168.527344 140.734375 168.5 140.003906 168.46875 139.265625 C 168.4375 138.535156 168.394531 137.832031 168.339844 137.15625 C 168.292969 136.644531 168.246094 136.191406 168.203125 135.800781 L 168.179688 135.773438 C 168.179688 135.773438 166.390625 134.601562 163.574219 133.546875 C 163.472656 133.515625 163.375 133.484375 163.273438 133.453125 C 161.191406 132.839844 158.972656 132.53125 156.628906 132.53125 C 154.75 132.53125 153.046875 132.828125 151.519531 133.414062 C 149.992188 134 148.703125 134.789062 147.648438 135.789062 C 146.589844 136.789062 145.765625 137.960938 145.183594 139.308594 C 144.59375 140.660156 144.300781 142.101562 144.300781 143.625 C 144.300781 146.914062 145.28125 149.410156 147.25 151.109375"></path></g>
    <g id="simda-home-lg-i" fill="currentColor"><path d="M 186.253906 125.054688 C 187.726562 125.054688 188.953125 124.5625 189.933594 123.582031 C 190.917969 122.601562 191.40625 121.3125 191.40625 119.71875 C 191.40625 118.246094 190.917969 116.976562 189.933594 115.902344 C 188.953125 114.828125 187.726562 114.289062 186.253906 114.289062 C 184.722656 114.289062 183.449219 114.828125 182.4375 115.902344 C 181.425781 116.976562 180.917969 118.246094 180.917969 119.71875 C 180.917969 121.3125 181.425781 122.601562 182.4375 123.582031 C 183.449219 124.5625 184.722656 125.054688 186.253906 125.054688"></path><path d="M 179.828125 135.722656 C 179.828125 135.722656 180.3125 135.753906 181 135.953125 C 181.519531 136.121094 182.203125 136.441406 182.792969 137.023438 C 183.933594 138.144531 183.957031 139.761719 183.957031 139.761719 L 183.964844 139.757812 C 183.988281 140.109375 183.980469 140.335938 183.980469 140.335938 L 183.980469 166.46875 L 191.40625 166.46875 L 191.40625 131.859375 C 191.40625 131.859375 191.375 131.558594 191.117188 131.589844 L 178.070312 133.304688 C 177.929688 133.820312 178.289062 134.820312 178.757812 135.273438 C 179.164062 135.675781 179.828125 135.722656 179.828125 135.722656"></path></g>
    <g id="simda-home-lg-m" fill="currentColor"><path d="M 243.664062 141.289062 C 244.722656 140.324219 245.9375 139.589844 247.320312 139.09375 C 248.695312 138.59375 250.152344 138.34375 251.679688 138.34375 C 253.671875 138.34375 255.109375 138.976562 255.992188 140.238281 C 256.871094 141.5 257.3125 143.945312 257.3125 147.589844 L 257.3125 166.46875 L 264.707031 166.46875 L 264.707031 144.332031 C 264.707031 140.628906 263.972656 137.742188 262.496094 135.65625 C 261.027344 133.574219 258.523438 132.53125 254.988281 132.53125 C 252.984375 132.53125 251.113281 132.972656 249.378906 133.855469 C 247.640625 134.734375 246.109375 135.699219 244.78125 136.757812 C 244.042969 137.347656 243.390625 137.917969 242.808594 138.46875 L 242.808594 142.1875 C 243.078125 141.875 243.359375 141.570312 243.664062 141.289062"></path><path d="M 218.875 141.289062 C 219.953125 140.324219 221.179688 139.589844 222.554688 139.09375 C 223.925781 138.59375 225.371094 138.34375 226.890625 138.34375 C 228.875 138.34375 230.289062 138.976562 231.140625 140.238281 C 231.984375 141.5 232.40625 143.945312 232.40625 147.589844 L 232.40625 166.46875 L 239.804688 166.46875 L 239.804688 149.699219 C 239.804688 149.667969 239.808594 149.632812 239.808594 149.605469 L 239.808594 143.738281 C 239.777344 142.816406 239.710938 142.035156 239.640625 141.414062 C 239.636719 141.417969 239.632812 141.421875 239.628906 141.425781 C 239.335938 138.609375 238.441406 136.417969 236.949219 134.863281 C 235.460938 133.308594 233.191406 132.53125 230.152344 132.53125 C 228.105469 132.53125 226.234375 132.957031 224.535156 133.808594 C 222.84375 134.660156 221.335938 135.613281 220.019531 136.667969 C 219.136719 137.382812 218.375 138.0625 217.71875 138.714844 L 217.71875 142.539062 C 218.074219 142.09375 218.453125 141.671875 218.875 141.289062"></path><path d="M 203.085938 135.722656 C 203.085938 135.722656 203.570312 135.753906 204.257812 135.953125 C 204.777344 136.121094 205.457031 136.441406 206.050781 137.023438 C 207.191406 138.144531 207.214844 139.761719 207.214844 139.761719 L 207.222656 139.757812 C 207.242188 140.109375 207.238281 140.335938 207.238281 140.335938 L 207.234375 166.46875 L 214.664062 166.46875 L 214.664062 131.859375 C 214.664062 131.859375 214.628906 131.558594 214.375 131.589844 L 201.332031 133.304688 C 201.1875 133.820312 201.542969 134.820312 202.011719 135.273438 C 202.421875 135.675781 203.085938 135.722656 203.085938 135.722656"></path></g>
    <g id="simda-home-lg-d" fill="currentColor"><path d="M 279.277344 166.402344 C 279.292969 166.417969 279.300781 166.433594 279.3125 166.449219 C 279.316406 166.457031 279.320312 166.460938 279.324219 166.46875 L 288.273438 166.46875 C 287.808594 166.117188 287.363281 165.722656 286.9375 165.300781 C 286.9375 165.300781 286.933594 165.296875 286.933594 165.296875 C 286.53125 164.890625 286.148438 164.464844 285.789062 164.007812 C 285.722656 163.921875 285.65625 163.835938 285.59375 163.746094 C 285.492188 163.617188 285.398438 163.484375 285.304688 163.351562 C 285.226562 163.242188 285.152344 163.132812 285.074219 163.023438 C 284.992188 162.902344 284.914062 162.773438 284.835938 162.648438 C 284.710938 162.453125 284.589844 162.25 284.472656 162.042969 C 284.394531 161.914062 284.320312 161.785156 284.25 161.648438 C 284.175781 161.507812 284.101562 161.363281 284.03125 161.226562 C 283.972656 161.109375 283.917969 160.996094 283.859375 160.878906 C 283.792969 160.730469 283.726562 160.585938 283.660156 160.4375 C 283.605469 160.320312 283.558594 160.199219 283.507812 160.082031 C 283.386719 159.789062 283.273438 159.492188 283.164062 159.1875 C 283.128906 159.089844 283.09375 158.996094 283.058594 158.898438 C 283.003906 158.730469 282.953125 158.558594 282.898438 158.390625 C 282.867188 158.277344 282.832031 158.164062 282.796875 158.050781 C 282.746094 157.875 282.699219 157.6875 282.648438 157.507812 C 282.625 157.414062 282.605469 157.316406 282.582031 157.21875 C 282.222656 155.722656 282.023438 154.132812 282.023438 152.476562 C 282.023438 149.144531 282.8125 146.050781 284.160156 143.472656 C 285.339844 141.21875 286.941406 139.347656 288.832031 138.082031 C 289.476562 137.644531 290.15625 137.28125 290.855469 136.988281 C 292.089844 136.488281 293.398438 136.214844 294.757812 136.214844 C 294.828125 136.214844 294.894531 136.21875 294.964844 136.222656 C 295.003906 136.21875 295.039062 136.21875 295.078125 136.21875 C 296.355469 136.21875 297.582031 136.453125 298.75 136.882812 C 298.847656 136.929688 298.953125 136.972656 299.050781 137.023438 C 299.792969 137.40625 300.617188 137.859375 301.304688 138.359375 L 301.304688 135.15625 C 300.25 134.277344 298.59375 133.601562 298.59375 133.601562 C 296.90625 132.882812 295.132812 132.53125 292.960938 132.53125 C 291.1875 132.53125 289.257812 132.988281 287.171875 133.898438 C 285.085938 134.808594 283.15625 136.128906 281.382812 137.859375 C 279.609375 139.59375 278.125 141.734375 276.925781 144.289062 C 275.722656 146.839844 275.125 149.730469 275.125 152.960938 C 275.125 155.953125 275.539062 158.625 276.367188 160.972656 C 277.109375 163.085938 278.089844 164.882812 279.277344 166.402344"></path><path d="M 300.207031 112.753906 C 300.207031 112.753906 300.691406 112.777344 301.378906 112.980469 C 301.898438 113.152344 302.582031 113.476562 303.171875 114.054688 C 304.3125 115.175781 304.335938 116.792969 304.335938 116.792969 L 304.34375 116.789062 C 304.367188 117.136719 304.359375 117.367188 304.359375 117.367188 L 304.355469 166.398438 L 311.785156 166.398438 L 311.785156 108.890625 C 311.785156 108.890625 311.75 108.589844 311.496094 108.625 L 298.453125 110.335938 C 298.308594 110.851562 298.667969 111.851562 299.132812 112.304688 C 299.546875 112.703125 300.207031 112.753906 300.207031 112.753906"></path></g>
    <g id="simda-home-lg-a" fill="currentColor"><path d="M 343.726562 148.554688 C 343.078125 148.789062 342.328125 149.011719 341.480469 149.214844 C 340.628906 149.425781 339.703125 149.613281 338.703125 149.789062 C 336.945312 150.199219 335.109375 150.699219 333.203125 151.285156 C 331.296875 151.871094 329.535156 152.652344 327.921875 153.617188 C 326.304688 154.589844 324.984375 155.820312 323.957031 157.316406 C 322.929688 158.8125 322.417969 160.652344 322.417969 162.820312 C 322.417969 164.210938 322.617188 165.402344 323.011719 166.398438 C 323.019531 166.414062 323.023438 166.433594 323.03125 166.449219 L 332.441406 166.449219 C 332.433594 166.441406 332.425781 166.4375 332.421875 166.429688 C 332.414062 166.417969 332.40625 166.410156 332.394531 166.398438 C 331.261719 165.226562 330.695312 163.539062 330.695312 161.320312 C 330.695312 159.679688 331.035156 158.300781 331.710938 157.183594 C 332.394531 156.070312 333.289062 155.148438 334.414062 154.410156 C 335.535156 153.675781 336.820312 153.105469 338.269531 152.695312 C 339.710938 152.285156 341.203125 151.933594 342.738281 151.636719 L 345.574219 151.199219 L 345.574219 158.066406 C 345.574219 159.535156 345.320312 160.886719 344.824219 162.113281 C 344.320312 163.351562 343.667969 164.46875 342.871094 165.378906 C 342.523438 165.78125 342.140625 166.128906 341.734375 166.449219 L 353.710938 166.449219 C 353.488281 165.957031 353.3125 165.296875 353.191406 164.539062 C 353.042969 163.628906 352.972656 162.144531 352.972656 160.089844 L 352.972656 144.945312 C 352.972656 142.421875 352.660156 140.367188 352.035156 138.785156 C 351.410156 137.199219 350.503906 135.9375 349.316406 134.996094 C 348.128906 134.058594 346.707031 133.414062 345.058594 133.0625 C 343.40625 132.707031 341.550781 132.53125 339.5 132.53125 C 339.421875 132.53125 339.339844 132.539062 339.261719 132.542969 L 339.273438 132.535156 C 339.273438 132.535156 327.21875 132.003906 324.296875 141.226562 C 324.144531 141.621094 324.039062 142.023438 323.980469 142.417969 C 323.976562 142.433594 323.972656 142.445312 323.96875 142.457031 L 323.972656 142.457031 C 323.941406 142.65625 323.808594 143.554688 323.996094 144.113281 C 324.109375 144.441406 324.328125 144.648438 324.738281 144.527344 L 324.742188 144.53125 L 324.785156 144.515625 C 324.847656 144.492188 324.914062 144.464844 324.984375 144.425781 L 330.394531 142.160156 C 330.828125 139.878906 331.761719 138.234375 333.207031 137.242188 C 334.320312 136.480469 335.386719 135.984375 336.949219 135.792969 C 336.957031 135.792969 336.964844 135.792969 336.972656 135.789062 C 336.992188 135.789062 337.007812 135.789062 337.023438 135.785156 C 337.492188 135.730469 338.003906 135.707031 338.574219 135.707031 C 338.636719 135.714844 338.695312 135.71875 338.753906 135.71875 C 341.234375 135.804688 342.988281 136.6875 343.988281 138.386719 C 345.042969 140.175781 345.574219 142.453125 345.574219 145.210938 C 345.574219 146.386719 345.472656 147.179688 345.265625 147.585938 C 345.0625 147.996094 344.546875 148.324219 343.726562 148.554688"></path></g>
    <g id="simda-home-lg-all"><use href="#simda-home-lg-emb"></use><use href="#simda-home-lg-brk"></use><use href="#simda-home-lg-s"></use><use href="#simda-home-lg-i"></use><use href="#simda-home-lg-m"></use><use href="#simda-home-lg-d"></use><use href="#simda-home-lg-a"></use></g>
  </defs>
</svg>

<section className="hero-track" aria-label="소개">
  <div className="hero-stage">
    <div className="hc">
      <div className="hc-in">
        <p className="t-eye">심다</p>
        <h1 className="t-hero">식물과 함께하는 <span className="grad">일상.</span></h1>
        <p className="t-intro">국내 1호 식물 큐레이터가 공간의 결에 맞는 식물을 고르고, 가꾸고, 전합니다.</p>
        <div className="btns">
          <Link className="btn" href="/support/booking">예약상담</Link>
          <Link className="btn btn-o" href="/story">심다 이야기</Link>
        </div>
      </div>
    </div>
    <div className="hm">
      <img src={hero.url} alt={hero.alt} />
      <div className="hm-scrim"></div>
    </div>
    <div className="h-cap">
      <p>한 그루에서 시작해,<br />공간 전체로.</p>
      <p>2016년부터 100곳이 넘는 공간을 식물로 바꿨습니다.</p>
    </div>
  </div>
</section>

<section className="hl" id="service" aria-label="서비스 하이라이트">
  <div className="hl-track">
    <div className="hl-stage">
      <div className="hl-head">
        <h2 className="t-h2">심다를 한눈에.</h2>
        <Link className="lk" href="/services">서비스 전체 보기 ›</Link>
      </div>
      <div className="hl-row">
        <article className="gc">
          <p className="gc-cap">식물관리.<br /><span>정기 방문으로 물·빛·흙을 살피고 기록합니다.</span></p>
          <div className="gc-ph"><img src={care.url} alt={care.alt} /></div>
          <div className="ring-card" aria-hidden="true">
            <svg viewBox="0 0 300 300">
              <g transform="rotate(-90 150 150)">
                <circle className="rg-t rg-t1" cx="150" cy="150" r="120"></circle>
                <circle className="rg rg1" cx="150" cy="150" r="120" pathLength="1"></circle>
                <circle className="rg-t rg-t2" cx="150" cy="150" r="88"></circle>
                <circle className="rg rg2" cx="150" cy="150" r="88" pathLength="1"></circle>
                <circle className="rg-t rg-t3" cx="150" cy="150" r="56"></circle>
                <circle className="rg rg3" cx="150" cy="150" r="56" pathLength="1"></circle>
              </g>
            </svg>
            <div className="legend"><span><i className="i1"></i>물</span><span><i className="i2"></i>빛</span><span><i className="i3"></i>흙</span></div>
          </div>
        </article>
        <article className="gc">
          <p className="gc-cap">교육.<br /><span>기업과 기관, 학교를 위한 식물 워크숍.</span></p>
          <div className="gc-ph"><img src={education.url} alt={education.alt} /></div>
        </article>
        <article className="gc">
          <p className="gc-cap">조경.<br /><span>주거와 상업 공간의 정원을 설계하고 시공합니다.</span></p>
          <div className="gc-ph"><img src={landscape.url} alt={landscape.alt} /></div>
        </article>
        <article className="gc">
          <p className="gc-cap">판매.<br /><span>공간에 맞는 식물을 골라 보내 드립니다.</span></p>
          <div className="gc-ph"><img src={sales.url} alt={sales.alt} /></div>
        </article>
        <article className="gc">
          <p className="gc-cap">simda 플랫폼.<br /><span>동네 가게가 직접 전하는 식물 선물.</span></p>
          <div className="gc-ph"><img src={platform.url} alt={platform.alt} /></div>
        </article>
      </div>
      <div className="hl-dots">
        <div className="hl-dots-in" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><b></b></div>
        <button type="button" className="hl-cue" aria-label="아래로 스크롤해 다음 서비스 보기" onClick={event => {
          // The row moves with vertical scroll: 5 cards = 4 steps across 92% of the pinned range.
          const track = event.currentTarget.closest(".hl-track") as HTMLElement;
          window.scrollBy({ top: (track.offsetHeight - window.innerHeight) * 0.23, behavior: "smooth" });
        }}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg></button>
      </div>
    </div>
  </div>
</section>

<section id="story" aria-label="브랜드 스토리">
  <div className="story wrap center">
    <p className="t-eye rv">브랜드 스토리</p>
    <h2 className="t-hero rv">식물로 공간을 바꿉니다.</h2>
    <p className="t-intro rv2">2016년, 국내 1호 식물 큐레이터 이주연 대표가 심다를 시작했습니다. <b>정원을 짓고, 식물을 돌보고, 식물 생활을 가르쳐 온 10년.</b> 이제는 <b>동네 가게와 이웃을 잇는 simda 플랫폼</b>까지 넓혔습니다.</p>
  </div>
  <div className="imm-track">
    <div className="imm-stage">
      <div className="imm">
        <img src={story.url} alt={story.alt} />
        <div className="imm-sh"></div>
        {story.url === defaultImages["home.story"].url && <p className="imm-cap">조경 · 2025<b>오페라박물관 조경 디자인 및 시공</b></p>}
      </div>
    </div>
  </div>
  <div className="facts">
    <div className="wide facts-in">
      <div>
        <h3 className="t-h2 rv">숫자로 보는 심다.</h3>
        <p className="body rv">기업 사옥과 매장, 박물관, 병원까지. 심다는 <b>공간마다 다른 빛과 바람을 읽고</b> 그곳에 맞는 식물을 고릅니다. 식물과 공간을 위한 기술도 <b>직접 연구하고 특허로 등록</b>했습니다.</p>
      </div>
      <div className="stats">
        <div className="rv"><p className="st-n ggreen"><span className="cnt n100"></span>+</p><p className="st-l">대외 프로젝트</p></div>
        <div className="rv"><p className="st-n ggold"><span className="cnt n3"></span><small>건</small></p><p className="st-l">등록 특허 · 위치 기반 비대면 식물 입찰 플랫폼 외</p></div>
        <div className="rv"><p className="st-n ggold"><span className="cnt n2"></span><small>회</small></p><p className="st-l">공식 수상 · 2023 오브젝트 바이 프라이즈 외</p></div>
        <div className="rv"><p className="st-n"><span className="cnt n5"></span><small>억 원</small></p><p className="st-l">연구개발 투자</p></div>
      </div>
    </div>
  </div>
</section>

<section className="pf" id="platform" aria-label="simda 플랫폼">
  <div className="pfi">
    <p className="t-eye rv">simda 플랫폼</p>
    <h2 className="t-hero rv">동네 가게의 <span className="grad">선물.</span></h2>
    <p className="t-intro rv2">가장 가까운 가게가 정성껏 준비해 문 앞까지 배송합니다.</p>
    <span className="badge rv2"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg>특허 등록 · 위치 기반 비대면 식물 입찰 플랫폼</span>
  </div>
  <div className="pf-track">
    <div className="pf-stage">
      <div className="pf-caps">
        <div className="cap c1"><p className="cap-n">01</p><h3>가장 가까운<br />가게가</h3><p className="cap-b">선물을 고르면, 내 위치에서 가까운 동네 가게를 먼저 찾습니다.</p></div>
        <div className="cap c2"><p className="cap-n">02</p><h3>정성껏<br />준비해</h3><p className="cap-b">가게가 직접 고르고 다듬어, 마음을 담아 포장합니다.</p></div>
        <div className="cap c3"><p className="cap-n">03</p><h3>문 앞까지<br />배송합니다.</h3><p className="cap-b">가까운 곳에서 바로 출발해 신선하게 도착합니다.</p></div>
        <div className="cap c4"><p className="cap-n">simda.me</p><h3>가까워서<br />더 따뜻한 선물.</h3><p className="cap-b">마음을 전하고 싶은 날, 동네 가게가 대신 전해 드립니다.</p><a className="btn" href="https://www.simda.me" target="_blank" rel="noopener">simda.me 바로가기 ↗</a></div>
      </div>

      <div className="ph-pos">
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
              <div className="ab"><svg viewBox="122 107 255 87" aria-hidden="true"><use href="#simda-home-lg-all"></use></svg><span>우리 동네 ⌄</span></div>
            </div>
            <div className="island"></div>
            <div className="sheet s1"><p className="sh-t">가까운 가게를 찾고 있어요</p><p className="sh-s">반경 1km · 동네 가게 4곳</p><div className="sh-chips"><span>꽃집</span><span>화원</span><span>식물 가게</span></div></div>
            <div className="sheet s2"><div className="sh-row"><img src={platform.url} alt={platform.alt} /><div><p className="sh-t">동네 꽃집</p><p className="sh-s">800m · 선물을 준비하고 있어요</p></div></div><div className="sh-bar"><span></span></div></div>
            <div className="sheet s3"><p className="sh-t">배송 중</p><p className="sh-s">동네 꽃집에서 출발했어요 · 곧 도착</p><div className="sh-bar"><span></span></div></div>
            <div className="sheet s4"><img className="sh-big" src={gift.url} alt={gift.alt} /><div className="sh-ok"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M8 12.5l2.5 2.5L16 9.5"></path></svg><p className="sh-t">선물이 도착했습니다.</p></div></div>
          </div>
        </div>
        <figure className="side sd1"><img src={platform.url} alt={platform.alt} /><figcaption>동네 꽃집이 직접 고르고 포장합니다.</figcaption></figure>
        <figure className="side sd2"><img src={gift.url} alt={gift.alt} /><figcaption>오늘 도착한 선물.</figcaption></figure>
      </div>

      <div className="pf-bar" aria-hidden="true"><span></span></div>
    </div>
  </div>
</section>

<HomeWork />

<HomeClients />

<HomeMagazine />

<section className="ways" id="start" aria-label="시작하는 방법">
  <div className="wide">
    <h2 className="t-h2 center rv">심다와 시작하는 세 가지 방법.</h2>
    <div className="ways-g">
      <div className="way">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path className="wi" pathLength="1" d="M8 2v4"></path><path className="wi" pathLength="1" d="M16 2v4"></path><path className="wi" pathLength="1" d="M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"></path><path className="wi" pathLength="1" d="M3 10h18"></path></svg>
        <h3>예약상담</h3>
        <p>식물 큐레이터와 마주 앉아 공간과 일상에 맞는 식물을 함께 고릅니다.</p>
        <Link className="lk" href="/support/booking">예약상담 신청하기 ›</Link>
      </div>
      <div className="way" id="b2b">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path className="wi" pathLength="1" d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path><path className="wi" pathLength="1" d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path><path className="wi" pathLength="1" d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"></path><path className="wi" pathLength="1" d="M10 6h4M10 10h4M10 14h4M10 18h4"></path></svg>
        <h3>B2B 협업</h3>
        <p>사옥과 매장, 공공 공간의 조경과 식물 관리를 함께 설계합니다.</p>
        <Link className="lk" href="/support/b2b">프로젝트 문의하기 ›</Link>
      </div>
      <div className="way">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path className="wi" pathLength="1" d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><path className="wi" pathLength="1" d="M3 6h18"></path><path className="wi" pathLength="1" d="M16 10a4 4 0 0 1-8 0"></path></svg>
        <h3>온라인샵</h3>
        <p>simda.me에서 동네 가게가 준비하는 식물 선물을 보냅니다.</p>
        <a className="lk" href="https://www.simda.me" target="_blank" rel="noopener">simda.me 바로가기 ↗</a>
      </div>
    </div>
  </div>
  <div className="sig">
    <svg viewBox="122 107 255 87" role="img" aria-label="simda">
      <use className="p-brk" href="#simda-home-lg-brk"></use>
      <use className="p-l p-s" href="#simda-home-lg-s"></use>
      <use className="p-l p-i" href="#simda-home-lg-i"></use>
      <use className="p-l p-m" href="#simda-home-lg-m"></use>
      <use className="p-l p-d" href="#simda-home-lg-d"></use>
      <use className="p-l p-a" href="#simda-home-lg-a"></use>
      <use className="p-emb" href="#simda-home-lg-emb"></use>
    </svg>
    <p>식물과 함께하는 일상의 큐레이션.</p>
  </div>
</section>

<div className="pass-wrap">
  <div className="pass"><p>공간에 맞는 식물, 큐레이터와 상담하세요.</p><Link className="btn" href="/support/booking">예약상담</Link></div>
</div>


  </div>;
}
