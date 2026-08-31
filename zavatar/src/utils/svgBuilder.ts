import { CustomizationParams, AvatarFaceShape, AvatarHairStyle, AvatarOutfit, AvatarExpression } from '../types';

/**
 * Modular SVG definitions for parametric rendering
 */
const FACE_PATHS: Record<string, string> = {
  oval: `M 176 170 C 176 110, 336 110, 336 170 C 336 280, 312 372, 256 376 C 200 372, 176 280, 176 170 Z`,
  round: `M 166 175 C 166 115, 346 115, 346 175 C 346 275, 334 366, 256 370 C 178 366, 166 275, 166 175 Z`,
  square: `M 170 165 C 170 110, 342 110, 342 165 C 342 265, 338 340, 300 366 L 212 366 C 174 340, 170 265, 170 165 Z`,
  heart: `M 166 160 C 166 110, 346 110, 346 160 C 346 250, 310 340, 256 380 C 202 340, 166 250, 166 160 Z`,
  diamond: `M 186 160 C 190 115, 322 115, 326 160 C 352 230, 325 330, 256 378 C 187 330, 160 230, 186 160 Z`
};

export class SvgBuilder {
  /**
   * Generates a fully composed, valid standalone SVG string from customization params
   */
  public static buildAvatarSvg(params: CustomizationParams): string {
    const skinTone = params.skinTone || '#F5CBA7';
    const hairColor = params.hairColor || '#1e1e1e';
    const faceShape = (params.faceShape || 'oval').toLowerCase();
    const hairStyle = (params.hairStyle || 'short-straight').toLowerCase();
    const outfit = (params.outfit || 'business-formal').toLowerCase();
    const outfitColor = params.outfitColor || this.getDefaultOutfitColor(outfit);
    const expression = (params.expression || 'neutral').toLowerCase();
    
    // Sliders (0-100, default 50)
    const eyeScale = 0.7 + ((params.eyeSize ?? 50) / 100) * 0.6; // 0.7 to 1.3
    const noseScale = 0.7 + ((params.noseWidth ?? 50) / 100) * 0.6; // 0.7 to 1.3
    const jawScale = 0.85 + ((params.jawWidth ?? 50) / 100) * 0.3; // 0.85 to 1.15
    const hasGlasses = params.glasses === 'yes' || params.accessories?.includes('glasses');

    const backHair = this.renderBackHair(hairStyle, hairColor);
    const neckAndOutfit = this.renderOutfit(outfit, outfitColor, skinTone);
    const headAndEars = this.renderHeadAndEars(faceShape, skinTone, jawScale);
    const nose = this.renderNose(noseScale);
    const eyesAndExpression = this.renderExpression(expression, eyeScale);
    const frontHair = this.renderFrontHair(hairStyle, hairColor);
    const glasses = hasGlasses ? this.renderGlasses() : '';

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#1e293b" />
      <stop offset="100%" stop-color="#0f172a" />
    </radialGradient>
    <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="0.25"/>
    </filter>
  </defs>

  <!-- Background Canvas -->
  <rect width="512" height="512" rx="24" fill="url(#bgGrad)" />

  <!-- Avatar Group -->
  <g id="zavatar-root">
    <!-- Back Hair Layer -->
    ${backHair}

    <!-- Neck & Outfit Layer -->
    ${neckAndOutfit}

    <!-- Head & Ears Layer -->
    ${headAndEars}

    <!-- Nose Feature Layer -->
    ${nose}

    <!-- Eyes & Expression Layer -->
    ${eyesAndExpression}

    <!-- Front Hair Layer -->
    ${frontHair}

    <!-- Accessories Layer -->
    ${glasses}
  </g>
</svg>`;
  }

  private static getDefaultOutfitColor(outfit: string): string {
    switch (outfit) {
      case 'business-formal':
        return '#1e293b';
      case 'smart-casual':
        return '#2563eb';
      case 'creative-founder':
        return '#18181b';
      case 'techwear':
        return '#09090b';
      case 'regional-formal':
        return '#f8fafc';
      default:
        return '#1e293b';
    }
  }

  private static renderBackHair(hairStyle: string, hairColor: string): string {
    if (hairStyle === 'long-wavy') {
      return `<g id="hair-back" class="hair-back">
        <path d="M 140 180 C 130 250, 110 360, 130 420 C 150 440, 170 380, 175 320 L 337 320 C 342 380, 362 440, 382 420 C 402 360, 382 250, 372 180 Z" fill="${hairColor}" opacity="0.9" />
      </g>`;
    }
    if (hairStyle === 'afro') {
      return `<g id="hair-back" class="hair-back">
        <circle cx="256" cy="180" r="140" fill="${hairColor}" opacity="0.95" />
      </g>`;
    }
    return '';
  }

  private static renderHeadAndEars(faceShape: string, skinTone: string, jawScale: number): string {
    const pathD = FACE_PATHS[faceShape] || FACE_PATHS.oval;

    return `<!-- Head, Neck and Ears -->
    <g id="head-group">
      <!-- Neck -->
      <path d="M 215 320 L 210 395 L 302 395 L 297 320 Z" fill="${skinTone}" />
      <path d="M 215 320 C 235 345, 277 345, 297 320 L 297 340 C 277 362, 235 362, 215 340 Z" fill="#000000" fill-opacity="0.12" />

      <!-- Left Ear -->
      <path d="M 172 205 C 150 210, 150 255, 175 260 Z" fill="${skinTone}" stroke="#000000" stroke-opacity="0.1" stroke-width="1.5" />
      <path d="M 168 220 C 160 225, 160 245, 172 248" stroke="#000000" stroke-opacity="0.12" stroke-width="2" fill="none" />

      <!-- Right Ear -->
      <path d="M 340 205 C 362 210, 362 255, 337 260 Z" fill="${skinTone}" stroke="#000000" stroke-opacity="0.1" stroke-width="1.5" />
      <path d="M 344 220 C 352 225, 352 245, 340 248" stroke="#000000" stroke-opacity="0.12" stroke-width="2" fill="none" />

      <!-- Face Contour with Parametric Jaw Scaling -->
      <g transform="translate(256, 320) scale(${jawScale}) translate(-256, -320)">
        <path d="${pathD}" fill="${skinTone}" stroke="#000000" stroke-opacity="0.1" stroke-width="2" />
        <!-- Ambient Cheek Shading -->
        <ellipse cx="205" cy="275" rx="22" ry="14" fill="#000000" fill-opacity="0.04" />
        <ellipse cx="307" cy="275" rx="22" ry="14" fill="#000000" fill-opacity="0.04" />
        <!-- Chin Shadow -->
        <path d="M 234 352 C 244 358, 268 358, 278 352 C 274 362, 238 362, 234 352 Z" fill="#000000" fill-opacity="0.06" />
      </g>
    </g>`;
  }

  private static renderOutfit(outfit: string, outfitColor: string, skinTone: string): string {
    switch (outfit) {
      case 'business-formal':
        return `<g id="outfit-business-formal" class="outfit">
          <path d="M 80 512 C 90 410, 150 370, 205 355 L 230 420 L 256 512 L 282 420 L 307 355 C 362 370, 422 410, 432 512 Z" fill="${outfitColor}" />
          <polygon points="215,355 256,410 297,355 275,340 237,340" fill="#f8fafc" />
          <polygon points="250,380 262,380 267,490 256,512 245,490" fill="#dc2626" />
          <polygon points="247,370 265,370 262,385 250,385" fill="#991b1b" />
          <polygon points="205,355 240,430 220,440 180,380" fill="#0f172a" fill-opacity="0.6" />
          <polygon points="307,355 272,430 292,440 332,380" fill="#0f172a" fill-opacity="0.6" />
        </g>`;

      case 'smart-casual':
        return `<g id="outfit-smart-casual" class="outfit">
          <path d="M 80 512 C 90 410, 150 370, 205 355 L 235 430 L 256 512 L 277 430 L 307 355 C 362 370, 422 410, 432 512 Z" fill="${outfitColor}" />
          <polygon points="215,355 256,425 297,355 270,345 242,345" fill="#f1f5f9" />
          <polygon points="245,355 256,385 267,355" fill="${skinTone}" />
          <path d="M 205 355 L 242 440 L 225 450 L 175 385 Z" fill="#000000" fill-opacity="0.15" />
          <path d="M 307 355 L 270 440 L 287 450 L 337 385 Z" fill="#000000" fill-opacity="0.15" />
        </g>`;

      case 'creative-founder':
        return `<g id="outfit-creative-founder" class="outfit">
          <path d="M 80 512 C 90 410, 150 370, 205 355 L 210 335 C 210 330, 302 330, 302 335 L 307 355 C 362 370, 422 410, 432 512 Z" fill="${outfitColor}" />
          <path d="M 210 335 C 210 328, 302 328, 302 335 L 298 362 C 280 370, 232 370, 214 362 Z" fill="#27272a" />
          <line x1="256" y1="365" x2="256" y2="512" stroke="#3f3f46" stroke-width="2.5" />
          <path d="M 215 360 C 180 400, 140 450, 110 512" stroke="#27272a" stroke-width="2" fill="none" />
          <path d="M 297 360 C 332 400, 372 450, 402 512" stroke="#27272a" stroke-width="2" fill="none" />
        </g>`;

      case 'techwear':
        return `<g id="outfit-techwear" class="outfit">
          <path d="M 75 512 C 85 405, 145 365, 202 345 L 206 320 C 206 312, 306 312, 306 320 L 310 345 C 367 365, 427 405, 437 512 Z" fill="${outfitColor}" />
          <path d="M 205 320 L 220 365 L 292 365 L 307 320 Z" fill="#18181b" />
          <line x1="242" y1="325" x2="230" y2="512" stroke="#06b6d4" stroke-width="3" />
          <polygon points="150,380 180,370 200,430 170,440" fill="#27272a" stroke="#06b6d4" stroke-width="1" />
          <polygon points="362,380 332,370 312,430 342,440" fill="#27272a" />
          <rect x="315" y="440" width="30" height="12" rx="2" fill="#06b6d4" fill-opacity="0.8" />
        </g>`;

      case 'regional-formal':
      default:
        return `<g id="outfit-regional-formal" class="outfit">
          <path d="M 80 512 C 88 405, 145 365, 204 345 L 210 330 C 210 324, 302 324, 302 330 L 308 345 C 367 365, 424 405, 432 512 Z" fill="${outfitColor}" />
          <path d="M 210 330 C 210 322, 302 322, 302 330 L 298 355 C 280 362, 232 362, 214 355 Z" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5" />
          <rect x="251" y="340" width="10" height="172" fill="#d97706" />
          <line x1="256" y1="340" x2="256" y2="512" stroke="#fbbf24" stroke-width="2" />
          <circle cx="256" cy="355" r="3" fill="#b45309" />
          <circle cx="256" cy="380" r="3" fill="#b45309" />
          <circle cx="256" cy="405" r="3" fill="#b45309" />
          <circle cx="256" cy="430" r="3" fill="#b45309" />
          <path d="M 175 365 C 195 410, 215 470, 225 512" stroke="#d97706" stroke-width="3" fill="none" />
          <path d="M 337 365 C 317 410, 297 470, 287 512" stroke="#d97706" stroke-width="3" fill="none" />
        </g>`;
    }
  }

  private static renderNose(noseScale: number): string {
    return `<g id="feature-nose" transform="translate(256, 260) scale(${noseScale}, 1) translate(-256, -260)">
      <path d="M 253 235 L 253 268 C 253 273, 245 275, 242 275" stroke="#000000" stroke-opacity="0.18" stroke-width="2.5" stroke-linecap="round" fill="none" />
      <path d="M 242 275 C 248 279, 264 279, 270 275" stroke="#000000" stroke-opacity="0.22" stroke-width="2.5" stroke-linecap="round" fill="none" />
      <circle cx="245" cy="273" r="1.8" fill="#000000" fill-opacity="0.2" />
      <circle cx="267" cy="273" r="1.8" fill="#000000" fill-opacity="0.2" />
    </g>`;
  }

  private static renderExpression(expression: string, eyeScale: number): string {
    let eyebrows = '';
    let eyes = '';
    let mouth = '';

    switch (expression) {
      case 'smile':
        eyebrows = `
          <path d="M 195 195 C 210 190, 230 192, 240 198" stroke="#1f2937" stroke-width="4" stroke-linecap="round" fill="none" />
          <path d="M 317 195 C 302 190, 282 192, 272 198" stroke="#1f2937" stroke-width="4" stroke-linecap="round" fill="none" />`;
        eyes = `
          <g id="left-eye" transform="translate(215, 225) scale(${eyeScale}) translate(-215, -225)">
            <ellipse cx="215" cy="225" rx="14" ry="8.5" fill="#ffffff" stroke="#1f2937" stroke-width="2" />
            <circle cx="215" cy="224" r="6" fill="#1e293b" />
            <circle cx="217" cy="222" r="2.2" fill="#ffffff" />
          </g>
          <g id="right-eye" transform="translate(297, 225) scale(${eyeScale}) translate(-297, -225)">
            <ellipse cx="297" cy="225" rx="14" ry="8.5" fill="#ffffff" stroke="#1f2937" stroke-width="2" />
            <circle cx="297" cy="224" r="6" fill="#1e293b" />
            <circle cx="299" cy="222" r="2.2" fill="#ffffff" />
          </g>`;
        mouth = `
          <path d="M 230 310 C 242 328, 270 328, 282 310" stroke="#78350f" stroke-width="3.5" stroke-linecap="round" fill="none" />
          <path d="M 226 308 C 228 312, 228 314, 226 316" stroke="#78350f" stroke-width="2" stroke-linecap="round" fill="none" />
          <path d="M 286 308 C 284 312, 284 314, 286 316" stroke="#78350f" stroke-width="2" stroke-linecap="round" fill="none" />`;
        break;

      case 'laugh':
        eyebrows = `
          <path d="M 195 192 C 210 186, 230 188, 240 196" stroke="#1f2937" stroke-width="4" stroke-linecap="round" fill="none" />
          <path d="M 317 192 C 302 186, 282 188, 272 196" stroke="#1f2937" stroke-width="4" stroke-linecap="round" fill="none" />`;
        eyes = `
          <g id="left-eye" transform="translate(215, 225) scale(${eyeScale}) translate(-215, -225)">
            <path d="M 202 226 C 210 216, 222 216, 228 226" stroke="#1f2937" stroke-width="3.5" stroke-linecap="round" fill="none" />
          </g>
          <g id="right-eye" transform="translate(297, 225) scale(${eyeScale}) translate(-297, -225)">
            <path d="M 284 226 C 292 216, 304 216, 310 226" stroke="#1f2937" stroke-width="3.5" stroke-linecap="round" fill="none" />
          </g>`;
        mouth = `
          <path d="M 226 305 Q 256 308 286 305 C 286 338, 226 338, 226 305 Z" fill="#881337" stroke="#4c0519" stroke-width="2" />
          <path d="M 230 306 Q 256 308 282 306 C 280 314, 232 314, 230 306 Z" fill="#ffffff" />
          <path d="M 242 328 Q 256 320 270 328 Q 256 338 242 328 Z" fill="#fb7185" />`;
        break;

      case 'concerned':
        eyebrows = `
          <path d="M 195 204 C 210 200, 230 190, 240 188" stroke="#1f2937" stroke-width="4" stroke-linecap="round" fill="none" />
          <path d="M 317 204 C 302 200, 282 190, 272 188" stroke="#1f2937" stroke-width="4" stroke-linecap="round" fill="none" />`;
        eyes = `
          <g id="left-eye" transform="translate(215, 225) scale(${eyeScale}) translate(-215, -225)">
            <ellipse cx="215" cy="225" rx="14" ry="10" fill="#ffffff" stroke="#1f2937" stroke-width="2" />
            <circle cx="215" cy="223" r="5.5" fill="#1e293b" />
            <circle cx="217" cy="221" r="2" fill="#ffffff" />
          </g>
          <g id="right-eye" transform="translate(297, 225) scale(${eyeScale}) translate(-297, -225)">
            <ellipse cx="297" cy="225" rx="14" ry="10" fill="#ffffff" stroke="#1f2937" stroke-width="2" />
            <circle cx="297" cy="223" r="5.5" fill="#1e293b" />
            <circle cx="299" cy="221" r="2" fill="#ffffff" />
          </g>`;
        mouth = `
          <path d="M 235 320 C 245 314, 267 314, 277 320" stroke="#78350f" stroke-width="3.5" stroke-linecap="round" fill="none" />`;
        break;

      case 'surprised':
        eyebrows = `
          <path d="M 195 186 C 210 178, 230 180, 240 188" stroke="#1f2937" stroke-width="4" stroke-linecap="round" fill="none" />
          <path d="M 317 186 C 302 178, 282 180, 272 188" stroke="#1f2937" stroke-width="4" stroke-linecap="round" fill="none" />`;
        eyes = `
          <g id="left-eye" transform="translate(215, 223) scale(${eyeScale}) translate(-215, -223)">
            <circle cx="215" cy="223" r="14" fill="#ffffff" stroke="#1f2937" stroke-width="2" />
            <circle cx="215" cy="223" r="6" fill="#1e293b" />
            <circle cx="217" cy="221" r="2.5" fill="#ffffff" />
          </g>
          <g id="right-eye" transform="translate(297, 223) scale(${eyeScale}) translate(-297, -223)">
            <circle cx="297" cy="223" r="14" fill="#ffffff" stroke="#1f2937" stroke-width="2" />
            <circle cx="297" cy="223" r="6" fill="#1e293b" />
            <circle cx="299" cy="221" r="2.5" fill="#ffffff" />
          </g>`;
        mouth = `
          <ellipse cx="256" cy="320" rx="12" ry="16" fill="#881337" stroke="#4c0519" stroke-width="2" />
          <ellipse cx="256" cy="320" rx="9" ry="12" fill="#4c0519" />`;
        break;

      case 'wink':
        eyebrows = `
          <path d="M 195 194 C 210 190, 230 192, 240 198" stroke="#1f2937" stroke-width="4" stroke-linecap="round" fill="none" />
          <path d="M 317 198 C 302 195, 282 196, 272 201" stroke="#1f2937" stroke-width="4" stroke-linecap="round" fill="none" />`;
        eyes = `
          <g id="left-eye" transform="translate(215, 225) scale(${eyeScale}) translate(-215, -225)">
            <ellipse cx="215" cy="225" rx="14" ry="9" fill="#ffffff" stroke="#1f2937" stroke-width="2" />
            <circle cx="215" cy="225" r="6" fill="#1e293b" />
            <circle cx="217" cy="223" r="2.2" fill="#ffffff" />
          </g>
          <g id="right-eye" transform="translate(297, 225) scale(${eyeScale}) translate(-297, -225)">
            <path d="M 284 226 C 292 234, 304 234, 312 226" stroke="#1f2937" stroke-width="4" stroke-linecap="round" fill="none" />
            <path d="M 312 226 L 318 223" stroke="#1f2937" stroke-width="2.5" stroke-linecap="round" />
          </g>`;
        mouth = `
          <path d="M 232 312 C 245 324, 272 322, 282 308" stroke="#78350f" stroke-width="3.5" stroke-linecap="round" fill="none" />`;
        break;

      case 'neutral':
      default:
        eyebrows = `
          <path d="M 195 198 C 210 194, 230 196, 240 200" stroke="#1f2937" stroke-width="4" stroke-linecap="round" fill="none" />
          <path d="M 317 198 C 302 194, 282 196, 272 200" stroke="#1f2937" stroke-width="4" stroke-linecap="round" fill="none" />`;
        eyes = `
          <g id="left-eye" transform="translate(215, 225) scale(${eyeScale}) translate(-215, -225)">
            <ellipse cx="215" cy="225" rx="14" ry="9" fill="#ffffff" stroke="#1f2937" stroke-width="2" />
            <circle cx="215" cy="225" r="6" fill="#1e293b" />
            <circle cx="217" cy="223" r="2" fill="#ffffff" />
          </g>
          <g id="right-eye" transform="translate(297, 225) scale(${eyeScale}) translate(-297, -225)">
            <ellipse cx="297" cy="225" rx="14" ry="9" fill="#ffffff" stroke="#1f2937" stroke-width="2" />
            <circle cx="297" cy="225" r="6" fill="#1e293b" />
            <circle cx="299" cy="223" r="2" fill="#ffffff" />
          </g>`;
        mouth = `
          <path d="M 235 315 C 245 317, 267 317, 277 315" stroke="#78350f" stroke-width="3.5" stroke-linecap="round" fill="none" />
          <path d="M 245 324 C 252 327, 260 327, 267 324" stroke="#000000" stroke-opacity="0.08" stroke-width="2.5" stroke-linecap="round" fill="none" />`;
        break;
    }

    return `<g id="expression-group">
      <!-- Eyebrows -->
      ${eyebrows}
      <!-- Eyes -->
      ${eyes}
      <!-- Mouth -->
      ${mouth}
    </g>`;
  }

  private static renderFrontHair(hairStyle: string, hairColor: string): string {
    switch (hairStyle) {
      case 'short-straight':
        return `<g id="hair-short-straight" class="hair-style">
          <path d="M 160 175 C 155 105, 205 75, 256 75 C 307 75, 357 105, 352 175 C 352 195, 340 205, 335 185 C 330 150, 315 130, 256 130 C 197 130, 182 150, 177 185 C 172 205, 160 195, 160 175 Z" fill="${hairColor}" />
          <path d="M 180 145 C 200 165, 220 145, 250 160 C 275 145, 305 160, 330 142 C 310 120, 275 110, 250 110 C 220 110, 195 125, 180 145 Z" fill="#ffffff" fill-opacity="0.08" />
          <polygon points="166,170 176,170 174,215 168,215" fill="${hairColor}" />
          <polygon points="346,170 336,170 338,215 344,215" fill="${hairColor}" />
        </g>`;

      case 'short-curly':
        return `<g id="hair-short-curly" class="hair-style">
          <path d="M 155 175 C 145 140, 160 100, 195 85 C 220 70, 290 70, 315 85 C 350 100, 365 140, 355 175 C 362 195, 345 205, 335 185 C 330 145, 315 125, 256 125 C 197 125, 182 145, 177 185 C 167 205, 150 195, 155 175 Z" fill="${hairColor}" />
          <circle cx="185" cy="115" r="24" fill="${hairColor}" />
          <circle cx="225" cy="95" r="26" fill="${hairColor}" />
          <circle cx="270" cy="90" r="28" fill="${hairColor}" />
          <circle cx="315" cy="100" r="25" fill="${hairColor}" />
          <circle cx="340" cy="130" r="22" fill="${hairColor}" />
          <circle cx="170" cy="135" r="22" fill="${hairColor}" />
          <circle cx="205" cy="140" r="18" fill="${hairColor}" />
          <circle cx="240" cy="135" r="19" fill="${hairColor}" />
          <circle cx="275" cy="140" r="18" fill="${hairColor}" />
          <circle cx="310" cy="145" r="17" fill="${hairColor}" />
        </g>`;

      case 'buzz-cut':
        return `<g id="hair-buzz-cut" class="hair-style">
          <path d="M 172 165 C 172 108, 340 108, 340 165 C 340 180, 336 185, 330 170 C 322 138, 298 126, 256 126 C 214 126, 190 138, 182 170 C 176 185, 172 180, 172 165 Z" fill="${hairColor}" />
          <path d="M 180 160 C 200 135, 312 135, 332 160 C 325 142, 295 130, 256 130 C 217 130, 187 142, 180 160 Z" fill="#000000" fill-opacity="0.2" />
        </g>`;

      case 'long-wavy':
        return `<g id="hair-long-wavy" class="hair-style">
          <path d="M 155 170 C 150 95, 205 70, 256 70 C 307 70, 362 95, 357 170 C 357 260, 368 350, 350 410 C 335 410, 330 330, 332 240 C 332 165, 310 135, 256 135 C 202 135, 180 165, 180 240 C 182 330, 177 410, 162 410 C 144 350, 155 260, 155 170 Z" fill="${hairColor}" />
          <path d="M 188 150 C 220 170, 240 145, 275 160 C 260 135, 220 125, 188 150 Z" fill="#ffffff" fill-opacity="0.08" />
        </g>`;

      case 'bob':
        return `<g id="hair-bob" class="hair-style">
          <path d="M 152 170 C 150 90, 205 65, 256 65 C 307 65, 360 90, 358 170 C 360 260, 345 320, 335 325 C 325 330, 320 290, 324 230 C 324 165, 305 138, 256 138 C 207 138, 188 165, 188 230 C 192 290, 187 330, 177 325 C 167 320, 150 260, 152 170 Z" fill="${hairColor}" />
          <path d="M 175 140 C 200 155, 312 155, 337 140 C 325 125, 290 115, 256 115 C 222 115, 187 125, 175 140 Z" fill="#ffffff" fill-opacity="0.08" />
        </g>`;

      case 'afro':
        return `<g id="hair-afro" class="hair-style">
          <circle cx="160" cy="120" r="30" fill="${hairColor}" />
          <circle cx="210" cy="80" r="36" fill="${hairColor}" />
          <circle cx="260" cy="70" r="38" fill="${hairColor}" />
          <circle cx="310" cy="80" r="36" fill="${hairColor}" />
          <circle cx="355" cy="120" r="30" fill="${hairColor}" />
          <circle cx="370" cy="170" r="28" fill="${hairColor}" />
          <circle cx="142" cy="170" r="28" fill="${hairColor}" />
        </g>`;

      case 'side-part':
        return `<g id="hair-side-part" class="hair-style">
          <path d="M 155 170 C 150 90, 205 60, 256 60 C 310 60, 360 90, 355 170 C 355 195, 345 205, 335 185 C 330 150, 310 135, 256 135 C 205 135, 185 145, 178 185 C 172 205, 155 195, 155 170 Z" fill="${hairColor}" />
          <path d="M 180 130 C 230 90, 310 110, 342 155 C 325 130, 270 110, 220 120 C 195 125, 185 130, 180 130 Z" fill="#ffffff" fill-opacity="0.1" />
          <polygon points="166,170 176,170 174,215 168,215" fill="${hairColor}" />
          <polygon points="346,170 336,170 338,210 344,210" fill="${hairColor}" />
        </g>`;

      case 'bald':
      default:
        return `<g id="hair-bald" class="hair-style">
          <ellipse cx="256" cy="140" rx="45" ry="18" fill="#ffffff" fill-opacity="0.08" />
        </g>`;
    }
  }

  private static renderGlasses(): string {
    return `<g id="feature-glasses" class="accessory">
      <rect x="190" y="210" width="50" height="32" rx="8" fill="none" stroke="#18181b" stroke-width="4" />
      <rect x="272" y="210" width="50" height="32" rx="8" fill="none" stroke="#18181b" stroke-width="4" />
      <line x1="240" y1="222" x2="272" y2="222" stroke="#18181b" stroke-width="4" stroke-linecap="round" />
      <line x1="190" y1="220" x2="168" y2="216" stroke="#18181b" stroke-width="3" stroke-linecap="round" />
      <line x1="322" y1="220" x2="344" y2="216" stroke="#18181b" stroke-width="3" stroke-linecap="round" />
      <line x1="198" y1="216" x2="212" y2="216" stroke="#ffffff" stroke-opacity="0.6" stroke-width="2" stroke-linecap="round" />
      <line x1="280" y1="216" x2="294" y2="216" stroke="#ffffff" stroke-opacity="0.6" stroke-width="2" stroke-linecap="round" />
    </g>`;
  }
}
