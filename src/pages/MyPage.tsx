import { signIn, signOut } from '@choochmeque/tauri-plugin-google-auth-api';
import { invoke } from '@tauri-apps/api/core';
import { useAuth } from '../auth/AuthContext';

function MyPage() {
  const { user, login, logout } = useAuth(); // 전역 Auth 사용

  // 구글 로그인 함수
  async function handleLogin() {
    const googleClientId = await invoke<string>("c_get_env_value", { name: "GOOGLE_CLIENT_ID" });
    const googleClientPWD = await invoke<string>("c_get_env_value", { name: "GOOGLE_CLIENT_PWD" });

    try {
      const response = await signIn({
        clientId: googleClientId,
        clientSecret: googleClientPWD,
        scopes: ['openid', 'email', 'profile'],
      });
      alert("[OAuth] 로그인 성공!\n" + JSON.stringify(response, null, 2));

      const apiURL = await invoke<string>("c_get_env_value", { name: "API_URL" });
      alert("API URL: " + apiURL);
      const res = await fetch(`${apiURL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_token: response.idToken,
          client_id: googleClientId,
        }),
      });

      alert("Fetch 응답 상태: " + res.status);

      const data = await res.json();
      alert("서버에서 받은 데이터: " + JSON.stringify(data, null, 2));
      if (data.jwt) {
        // AuthContext를 통해 전역 로그인 처리
        login(data.user.email, data.jwt);
        console.log("서버 응답 데이터:", JSON.stringify(data, null, 2));
      }
    } catch (err) {
      alert("[OAuth] 로그인 실패: " + JSON.stringify(err, null, 2));

      console.error("로그인 실패:", err);
    }
  }

  // 로그아웃 핸들러
  async function handleLogout() {
    const accessToken = localStorage.getItem("accessToken") || undefined;
    try {
      // With token revocation (recommended)
      await signOut({ accessToken });
      // Or local sign-out only
      // await signOut();
      console.log('Successfully signed out');
    } catch (error) {
      console.error('Sign out failed:', error);
    }

    logout();
    alert("로그아웃되었습니다");
  }

  async function test() {
    const apiURL = "http://61.79.139.65:3000"; // 서버 주소
    const res = await fetch(`${apiURL}/ping`, {
      method: "GET", // ping은 GET 엔드포인트니까
    });

    const data = await res.json();
    console.log(data); // { message: "pong", success: true }
    alert("서버 연결 성공!"); // ✅ 완료버튼 대신 alert
  }

  return (
    <div className='container'>
      <h1>My Page</h1>
      <br />
      <button onClick={test}>test</button>
      {!user ? (
        <button onClick={handleLogin}>로그인</button>
      ) : (
        <div>
          <p>{user.email}</p>
          <p>환영합니다</p>
          <button onClick={handleLogout}>로그아웃</button>
        </div>
      )}
    </div>
  );
}

export default MyPage;
