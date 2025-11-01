/***********************************************************
 Login.tsx는 StoreRader의 사용자 계정 페이지다

 1. UI 구성
    - 로그인 전: "로그인" 버튼 표시
    - 로그인 후: 사용자 이메일 + "로그아웃" 버튼 표시

 2. 주요 기능
    - 구글 로그인
    - 구글 로그아웃
    - 로그인 상태 전역 관리
***********************************************************/

import { signIn, signOut } from '@choochmeque/tauri-plugin-google-auth-api';
import { invoke } from '@tauri-apps/api/core';
import { useAuth } from '../contexts/AuthContext';

function Login() {
  const { user, login, logout } = useAuth(); // 전역 Auth 사용

  // handleLogin()
  // 기능: Google 로그인 처리
  async function handleLogin() {
    const googleClientId = await invoke<string>("c_get_env_value", { name: "GOOGLE_CLIENT_ID" });
    const googleClientPWD = await invoke<string>("c_get_env_value", { name: "GOOGLE_CLIENT_PWD" });

    try {
      // Google OAuth 로그인 수행
      const response = await signIn({
        clientId: googleClientId,
        clientSecret: googleClientPWD,
        scopes: ['openid', 'email', 'profile'],
      });
      alert("[OAuth] 로그인 성공!\n" + JSON.stringify(response, null, 2));

      // 서버에 ID Token 전달
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

      // 서버 응답 처리
      const data = await res.json();
      alert("서버에서 받은 데이터: " + JSON.stringify(data, null, 2));

      // JWT 존재 시 전역 로그인 처리
      if (data.jwt) {
        login(data.user.email, data.jwt);
        console.log("서버 응답 데이터:", JSON.stringify(data, null, 2));
      }
    } catch (err) {
      alert("[OAuth] 로그인 실패: " + JSON.stringify(err, null, 2));

      console.error("로그인 실패:", err);
    }
  }



  // handleLogout()
  // Google 로그아웃 처리
  async function handleLogout() {
    const accessToken = localStorage.getItem("accessToken") || undefined;
    try {
      // Google OAuth 세션 해제
      await signOut({ accessToken });
      console.log('로그아웃되었습니다');
    } catch (error) {
      console.error('Sign out failed:', error);
    }

    logout();
    alert("로그아웃되었습니다");
  }


  // UI 구성
  return (
    <div className='container'>
      <h1>My Page</h1>
      <br />
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

export default Login;
