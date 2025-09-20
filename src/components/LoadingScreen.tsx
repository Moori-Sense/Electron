import MooriSense_logo from '../assets/MooriSense_logo.png';
import '../App.css';

// statusText를 props로 받아 표시하도록 수정
function LoadingScreen({ statusText }: { statusText: string }) {
  return (
    <div className="loading-wrapper">
      <img src={MooriSense_logo} className="main-logo" alt="MooriSense Logo" />
      <p className="loading-text">Loading...</p>
      <p className="status-text">{statusText}</p>
    </div>
  );
}

export default LoadingScreen;