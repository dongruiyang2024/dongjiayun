import CommentSection from '../components/CommentSection';

export default function Guestbook() {
  return (
    <main className="guestbook-page">
      <div className="page-header">
        <h1>💌 留言板</h1>
        <p>欢迎来自世界各地的朋友给我留言！</p>
      </div>

      <div className="guestbook-intro">
        <div className="guestbook-rules">
          <h3>🌟 留言小贴士</h3>
          <ul>
            <li>🤗 友善交流，互相尊重</li>
            <li>💬 可以分享你的故事和想法</li>
            <li>🌍 欢迎用任何语言留言</li>
            <li>💕 让我们一起传递正能量！</li>
          </ul>
        </div>
      </div>

      <CommentSection pageId="guestbook" title="给不不留言" />
    </main>
  );
}
