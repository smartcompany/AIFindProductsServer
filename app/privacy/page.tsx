import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — Remember Where',
  description:
    'Privacy policy for Remember Where (어디있더라?) mobile app and related API services.',
};

const styles = {
  main: {
    maxWidth: 720,
    margin: '0 auto',
    padding: '32px 20px 64px',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans KR", sans-serif',
    lineHeight: 1.65,
    color: '#1a1a1a',
  } as const,
  h1: {
    fontSize: '1.75rem',
    letterSpacing: '-0.02em',
    marginBottom: 8,
  } as const,
  updated: { color: '#6b6b66', fontSize: '0.95rem', marginBottom: 32 } as const,
  h2: {
    fontSize: '1.15rem',
    marginTop: 28,
    marginBottom: 8,
  } as const,
  p: { margin: '0 0 12px' } as const,
  ul: { margin: '0 0 12px', paddingLeft: 22 } as const,
  hr: { border: 'none', borderTop: '1px solid #e6e2db', margin: '36px 0' } as const,
  a: { color: '#2c3a2e' } as const,
};

export default function PrivacyPolicyPage() {
  return (
    <main style={styles.main}>
      <h1 style={styles.h1}>Privacy Policy</h1>
      <p style={styles.updated}>
        Remember Where (어디있더라?) · Last updated: 6 August 2026
      </p>

      <p style={styles.p}>
        This policy describes how the Remember Where mobile application
        (&quot;App&quot;) and the backend services operated for the App
        (&quot;Service&quot;, hosted at{' '}
        <a style={styles.a} href="https://ai-find-products-server.vercel.app">
          ai-find-products-server.vercel.app
        </a>
        ) handle information. The App is designed to store your location photos
        and notes primarily on your device.
      </p>

      <h2 style={styles.h2}>1. Information we process</h2>
      <ul style={styles.ul}>
        <li>
          <strong>On your device (local):</strong> photos you choose, location
          notes, tags you save, and app preferences. This data stays in the App
          unless you export or share it yourself.
        </li>
        <li>
          <strong>Online photo tagging (optional):</strong> when you use AI tag
          detection, the App sends the selected photo (as encoded image data),
          image type, and language preference to our Service. The Service forwards
          the image to Google&apos;s Gemini API to suggest item tags and returns
          tag text to the App. We do not use this API to build a permanent photo
          gallery on our servers.
        </li>
        <li>
          <strong>Desktop export:</strong> if you use &quot;View on desktop&quot;,
          the App builds a ZIP file on your device. We do not receive that ZIP
          unless you send it through a channel you choose (email, cloud, etc.).
        </li>
        <li>
          <strong>Ads and analytics:</strong> the App may use Google Mobile Ads
          and related SDKs, which may collect device/advertising identifiers
          according to Google&apos;s policies. Firebase may be used when enabled
          in your build.
        </li>
        <li>
          <strong>Technical logs:</strong> our Service may log request metadata
          (e.g. time, error messages) for reliability and security. We avoid
          logging full image content in routine operation.
        </li>
      </ul>

      <h2 style={styles.h2}>2. Purpose</h2>
      <ul style={styles.ul}>
        <li>Provide item/location photo storage and search on your device</li>
        <li>Provide optional AI-assisted tag suggestions</li>
        <li>Deliver app settings and ad configuration</li>
        <li>Maintain and protect the Service</li>
      </ul>

      <h2 style={styles.h2}>3. Retention</h2>
      <p style={styles.p}>
        Data stored in the App remains until you delete it or uninstall the App.
        Images sent for tagging are processed for that request and are not
        retained by us as user photo libraries. Server and provider logs may be
        kept for a limited period for operations and security.
      </p>

      <h2 style={styles.h2}>4. Sharing</h2>
      <p style={styles.p}>
        We do not sell your personal information. We share data only with
        service providers needed to run the App (e.g. Google Gemini for tagging,
        Google for ads, hosting on Vercel) and when required by law.
      </p>

      <h2 style={styles.h2}>5. Your choices</h2>
      <ul style={styles.ul}>
        <li>You can use the App without online tagging if you add tags manually.</li>
        <li>You can delete photos and data inside the App at any time.</li>
        <li>
          You can reset ad tracking in your device settings (Limit Ad Tracking /
          opt out of personalized ads).
        </li>
      </ul>

      <h2 style={styles.h2}>6. Children</h2>
      <p style={styles.p}>
        The App is not directed at children under 13 (or the minimum age in your
        region). We do not knowingly collect personal information from children.
      </p>

      <h2 style={styles.h2}>7. Contact</h2>
      <p style={styles.p}>
        Questions about this policy:{' '}
        <a style={styles.a} href="mailto:gunnylove@gmail.com">
          gunnylove@gmail.com
        </a>
      </p>

      <hr style={styles.hr} />

      <h1 style={styles.h1}>개인정보 처리방침</h1>
      <p style={styles.updated}>Remember Where (어디있더라?) · 시행일: 2026년 8월 6일</p>

      <p style={styles.p}>
        본 방침은 Remember Where 모바일 앱(&quot;앱&quot;)과 앱을 위해 운영하는
        서버(&quot;서비스&quot;,{' '}
        <a style={styles.a} href="https://ai-find-products-server.vercel.app">
          ai-find-products-server.vercel.app
        </a>
        )의 개인정보 처리에 대해 설명합니다. 앱은 위치·물건 사진과 메모를
        주로 기기 안에 저장하도록 설계되어 있습니다.
      </p>

      <h2 style={styles.h2}>1. 처리하는 정보</h2>
      <ul style={styles.ul}>
        <li>
          <strong>기기 내 저장:</strong> 사용자가 선택한 사진, 위치 메모, 태그,
          앱 설정. 사용자가 내보내거나 공유하지 않는 한 서버에 일괄 업로드되지
          않습니다.
        </li>
        <li>
          <strong>온라인 AI 태그(선택):</strong> AI 인식 사용 시, 선택한 사진
          데이터·MIME 타입·언어 설정이 서비스로 전송됩니다. 서비스는 Google
          Gemini API로 태그 후보를 받아 앱에 반환합니다. 당사가 사용자 사진
          보관함을 서버에 영구 저장하지 않습니다.
        </li>
        <li>
          <strong>데스크톱용 내보내기:</strong> ZIP은 기기에서만 생성되며,
          당사 서버로 자동 업로드되지 않습니다.
        </li>
        <li>
          <strong>광고·SDK:</strong> Google Mobile Ads 등 제3자 SDK가 기기/광고
          식별자를 처리할 수 있습니다.
        </li>
        <li>
          <strong>기술 로그:</strong> 서비스 안정성·보안을 위해 요청 시각, 오류
          등 최소한의 로그가 기록될 수 있습니다.
        </li>
      </ul>

      <h2 style={styles.h2}>2. 이용 목적</h2>
      <ul style={styles.ul}>
        <li>기기 내 사진·태그 저장 및 검색</li>
        <li>선택적 AI 태그 제안</li>
        <li>앱 설정·광고 구성 제공</li>
        <li>서비스 운영 및 보안</li>
      </ul>

      <h2 style={styles.h2}>3. 보관 기간</h2>
      <p style={styles.p}>
        앱 데이터는 사용자가 삭제하거나 앱을 제거할 때까지 기기에 남습니다. 태깅
        요청용 이미지는 해당 처리에 한해 사용되며, 당사가 사진 라이브러리 형태로
        장기 보관하지 않습니다.
      </p>

      <h2 style={styles.h2}>4. 제3자 제공</h2>
      <p style={styles.p}>
        개인정보를 판매하지 않습니다. 태깅(Google Gemini), 광고(Google), 호스팅(Vercel)
        등 서비스 제공에 필요한 범위에서 처리 위탁·제공이 이루어질 수 있으며,
        법령에 따른 경우를 제외하고 동의 없이 제3자에 제공하지 않습니다.
      </p>

      <h2 style={styles.h2}>5. 이용자 권리</h2>
      <ul style={styles.ul}>
        <li>AI 태깅 없이 수동 태그만 사용할 수 있습니다.</li>
        <li>앱에서 사진·데이터를 삭제할 수 있습니다.</li>
        <li>기기 설정에서 맞춤형 광고 제한 등을 선택할 수 있습니다.</li>
      </ul>

      <h2 style={styles.h2}>6. 아동</h2>
      <p style={styles.p}>
        앱은 만 13세 미만(또는 해당 지역의 최소 연령) 아동을 대상으로 하지
        않습니다.
      </p>

      <h2 style={styles.h2}>7. 문의</h2>
      <p style={styles.p}>
        개인정보 관련 문의:{' '}
        <a style={styles.a} href="mailto:gunnylove@gmail.com">
          gunnylove@gmail.com
        </a>
      </p>
    </main>
  );
}
