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
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface UserHistoryItem {
  id: number;
  store_id: string;
  store_name: string;
  good_id: number;
  good_name: string;
  price: number;
  current_price: number;
  x_coord: number | null;
  y_coord: number | null;
  created_at: string;
}

function Login() {
  const { user, login, logout } = useAuth(); // 전역 Auth 사용
  const [history, setHistory] = useState<UserHistoryItem[]>([]);

  const navigate = useNavigate();
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


  async function userHistory() {
    const apiURL = await invoke<string>("c_get_env_value", { name: "API_URL" });
    const jwt = localStorage.getItem("jwt");

    const res = await fetch(`${apiURL}/get/user-selection-log`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
    });
    console.log("STATUS =", res.status);

    const text = await res.text();
    console.log("BODY =", text);

    if (!res.ok) {
      alert("히스토리 불러오기 실패");
      return;
    }

    const data: UserHistoryItem[] = JSON.parse(text);
    setHistory(data);
  }

  // UI 구성
  return (
    <div className='container'>
      <h1>My Info</h1>
      <br />
      {!user ? (
        <button onClick={handleLogin}>로그인</button>
      ) : (
        <div>
          <p>{user.email}</p>
          <p>환영합니다</p>
          <button onClick={handleLogout}>로그아웃</button>
          <button onClick={userHistory}>기록 보기</button>

        </div>
      )}


      {history.length > 0 && (
        <ul
          style={{
            marginTop: "15px",
            paddingLeft: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingBottom: "80px",
          }}
        >
          {history.map((item) => (
            <li
              key={item.id}
              style={{
                width: "90%",
                maxWidth: "480px",
                background: "#fff",
                padding: "14px 16px",
                marginBottom: "14px",
                borderRadius: "12px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                listStyle: "none",
                cursor: "pointer",
              }}
              onClick={() => {
                // 히스토리에서 선택한 매장/상품 정보 저장
                localStorage.setItem("historyFlag", "1");
                localStorage.setItem("historyStoreId", item.store_id);
                localStorage.setItem("historyGoodId", item.good_id.toString());
                localStorage.setItem("historyGoodName", item.good_name);

                navigate("/map");
              }}
            >
              {/* 날짜 */}
              <div
                style={{
                  fontSize: "12px",
                  color: "#888",
                  marginBottom: "6px",
                }}
              >
                {new Date(item.created_at).toLocaleString()}
              </div>

              {/* 상품명 */}
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  marginBottom: "4px",
                }}
              >
                {item.good_name}
              </div>

              {/* 매장명 */}
              <div
                style={{
                  fontSize: "14px",
                  color: "#444",
                  marginBottom: "8px",
                }}
              >
                {item.store_name}
              </div>

              {/* 금액 영역 */}
              <div style={{ fontSize: "14px", marginTop: "4px" }}>
                {/* 당시 가격은 항상 표시 */}
                <div>
                  <span style={{ color: "#555" }}>당시 가격: </span>
                  <strong>
                    {item.price != null
                      ? item.price.toLocaleString() + "원"
                      : "정보 없음"}
                  </strong>
                </div>

                {/* 현재 금액: price와 다를 때만 추가로 표시 */}
                {item.current_price != null && item.current_price !== item.price && (
                  <div style={{ marginTop: "3px" }}>
                    <span style={{ color: "#555" }}>현재 가격: </span>
                    <strong style={{ color: "#d9534f" }}>
                      {item.current_price.toLocaleString()}원
                    </strong>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Login;
