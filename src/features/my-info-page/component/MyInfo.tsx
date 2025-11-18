import { useMyInfo } from "../hooks/useMyInfo";
import UserHistoryList from "./UserHistory";

export default function MyInfo() {
  const { user, history, handleLogin, handleLogout, loadHistory } = useMyInfo();

  return (
    <div className="container">
      <h1>My Info</h1>
      <br />

      {!user ? (
        <button onClick={handleLogin}>로그인</button>
      ) : (
        <div>
          <p>{user.email}</p>
          <p>환영합니다</p>
          <button onClick={handleLogout}>로그아웃</button>
          <button onClick={loadHistory}>기록 보기</button>

        </div>
      )}

      {history.length > 0 && <UserHistoryList history={history} />}
    </div>
  );
}
