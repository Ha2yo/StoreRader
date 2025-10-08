import { signIn } from '@choochmeque/tauri-plugin-google-auth-api';
import { invoke } from '@tauri-apps/api/core';

function MyPage() {
  console.log('마이페이지 화면 로딩');

  // 구글 로그인
  async function login() {
    console.log("[OAuth] 로그인 버튼 클릭");

    const googleClientId = await invoke<string>(
      "get_env", { name: "GOOGLE_CLIENT_ID" });
    const googleClientPWD = await invoke<string>(
      "get_env", { name: "GOOGLE_CLIENT_PWD" });

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
    } catch (err) {
      console.error('[OAuth] 로그인 실패:', err);
    }
  }

  function db_test() {
    invoke('print_all_users');
  }
  return (
    <div className='container'>
      <h1>My page</h1>
      <br />
      <div>
        <button onClick={login}>로그인</button>
        <br /><br />
        <button onClick={db_test}>db test</button>
      </div>
    </div>
  );
}

export default MyPage;