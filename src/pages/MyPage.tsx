import { signIn } from '@choochmeque/tauri-plugin-google-auth-api';
import { invoke } from '@tauri-apps/api/core';

function MyPage() {
  console.log('마이페이지 화면 로딩');

  // 구글 로그인
  async function login() {
    console.log("[OAuth] 로그인 버튼 클릭");

    const googleClientId = await invoke<string>(
      "c_get_env_value", { name: "GOOGLE_CLIENT_ID" });
    const googleClientPWD = await invoke<string>(
      "c_get_env_value", { name: "GOOGLE_CLIENT_PWD" });

    try {
      console.log("[OAuth] Client Id가 설정되었습니다: ", googleClientId);
      console.log("[OAuth] Client PWD가 설정되었습니다: ", googleClientPWD);

      const response = await signIn({
        clientId: googleClientId,
        clientSecret: googleClientPWD,
        scopes: ['openid', 'email', 'profile'],
        successHtmlResponse: '<h1>Success!</h1>' // Optional: custom success message (desktop)
      });

      console.log("[OAuth] 로그인 성공!");
      console.log('[OAuth] ID Token:', response.idToken);
      console.log('[OAuth] Access Token:', response.accessToken);
      console.log('[OAuth] Refresh Token:', response.refreshToken);
      console.log('[OAuth] Expires at:', new Date((response as any).expiresAt));

      // const verifyResult = await invoke("c_login_user", {
      //    idToken: response.idToken,
      //    clientId: googleClientId,
      //  });

      const apiURL = await invoke<string>(
        "c_get_env_value", { name: "API_URL" });

      const res = await fetch(`${apiURL}/auth/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_token: response.idToken,
          client_id: googleClientId,
        }),
      });
      const data = await res.json();
      console.log("[서버 응답]", data);

      console.log("[백엔드 검증 성공]:" + JSON.stringify(data, null, 2));
      alert("로그인 검증 성공!\n" + JSON.stringify(data, null, 2));

    } catch (err) {
      console.error('[OAuth] 로그인 실패:', err);
    }


  }
  return (
    <div className='container'>
      <h1>My page</h1>
      <br />
      <div>
        <button onClick={login}>로그인</button>
      </div>
    </div>
  );
}

export default MyPage;