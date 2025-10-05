const canvas = document.getElementById('roulette');
const ctx = canvas.getContext('2d');
const spinButton = document.getElementById('spinButton');
const resultDiv = document.getElementById('result');
const userInput = document.getElementById('userInput');

let segments = [];
let colors = [];
let startAngle = 0;
let spinTime = 0;
let spinTimeTotal = 0;
let totalAngle = 0;
let isSpinning = false;

// パステルカラーパレット
const colorPalette = ["#FF6B6B", "#6BCB77", "#4D96FF", "#FFD93D", "#FF6EC7", "#6A4C93", "#FF9F1C", "#2EC4B6"];

// Canvasリサイズ関数（レスポンシブ対応）
function resizeCanvas() {
    const size = Math.min(window.innerWidth * 0.9, 400);
    canvas.width = size;
    canvas.height = size;
    drawRoulette();
}
window.addEventListener('resize', resizeCanvas);

function drawRoulette() {
    if (segments.length === 0) return;

    const size = Math.floor(Math.min(window.innerWidth * 0.9, 400));
    canvas.width = size;
    canvas.height = size;

    const cx = Math.floor(canvas.width / 2);
    const cy = Math.floor(canvas.height / 2);
    const radius = Math.floor(canvas.width / 2);
    const arc = (2 * Math.PI) / segments.length;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // セグメント描画
    for (let i = 0; i < segments.length; i++) {
        const angle = startAngle + i * arc;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, angle, angle + arc);
        ctx.closePath();
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();
    }

    // テキスト
    for (let i = 0; i < segments.length; i++) {
        const angle = startAngle + i * arc + arc / 2;
        const textRadius = radius * 0.65;
        const x = cx + Math.cos(angle) * textRadius;
        const y = cy + Math.sin(angle) * textRadius;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle + Math.PI / 2);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#fff";
        ctx.font = `${Math.floor(canvas.width / 15)}px Arial`;
        ctx.fillText(segments[i], 0, 0);
        ctx.restore();
    }

    // 矢印描画
    drawArrow(cx, cy, radius);
}

function drawArrow(cx, cy, radius) {
    const arrowWidth = radius * 0.3;   // 横幅（ややワイド）
    const arrowLength = radius * 0.45; // 縦方向の長さ（以前より長め）
    ctx.fillStyle = "#ffcc00";
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;

    ctx.shadowColor = "rgba(255, 255, 0, 0.6)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 2;


    ctx.beginPath();
    // 上部中央を基準に少し長めの矢印を描く
    ctx.moveTo(cx, cy - radius + 40); // ルーレット円の内側から
    ctx.lineTo(cx - arrowWidth / 2, cy - radius - arrowLength);
    ctx.lineTo(cx + arrowWidth / 2, cy - radius - arrowLength);
    ctx.closePath();

    ctx.fill();
    ctx.stroke();
}






// easing関数
function easeInOut(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
}

// スピンアニメーション
function rotateWheel() {
    spinTime += 30;
    if (spinTime >= spinTimeTotal) {
        startAngle = totalAngle;
        stopRotateWheel();
        return;
    }
    startAngle = easeInOut(spinTime, 0, totalAngle, spinTimeTotal);
    drawRoulette();
    requestAnimationFrame(rotateWheel);
}

// スピン開始
function spin() {
    if (isSpinning) return;
    isSpinning = true;
    spinTime = 0;
    spinTimeTotal = Math.random() * 2000 + 3000;
    const rotations = 10 + Math.random() * 5;
    const extra = Math.random() * 2 * Math.PI;
    totalAngle = rotations * 2 * Math.PI + extra;
    rotateWheel();
}

// スピン終了
function stopRotateWheel() {
    const normalized = (startAngle % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
    const angleFromArrow = (normalized + Math.PI / 2) % (2 * Math.PI);
    let index = Math.floor(segments.length - angleFromArrow / (2 * Math.PI) * segments.length) % segments.length;
    if (index < 0) index += segments.length;

    drawRoulette();
    resultDiv.innerHTML = `Selected: ${segments[index]}`;
    resultDiv.style.color = colors[index % colors.length]; // 選択色を反映
    isSpinning = false;
}

// ユーザー入力更新
function updateSegments() {
    const input = userInput.value.trim();
    if (!input) return;
    segments = input.split("\n").map(s => s.trim()).filter(s => s !== "");
    if (segments.length < 2) return;
    colors = segments.map((_, i) => colorPalette[i % colorPalette.length]);
    startAngle = 0;
    drawRoulette();
    resultDiv.innerHTML = "";
}

// Twitterシェア
function shareTwitter() {
    if (!resultDiv.innerText) return;
    const text = encodeURIComponent(resultDiv.innerText);
    const url = encodeURIComponent(window.location.href);
    const twitterURL = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
    window.open(twitterURL, '_blank');
}

// ボタンイベント
const shareButton = document.getElementById('shareTwitterButton');
shareButton.addEventListener('click', shareTwitter);

// stopRotateWheel で結果表示時にシェアボタンを表示
function stopRotateWheel() {
    const normalized = (startAngle % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
    const angleFromArrow = (normalized + Math.PI / 2) % (2 * Math.PI);
    let index = Math.floor(segments.length - angleFromArrow / (2 * Math.PI) * segments.length) % segments.length;
    if (index < 0) index += segments.length;

    drawRoulette();
    resultDiv.innerHTML = `Selected: ${segments[index]}`;
    resultDiv.style.color = colors[index % colors.length];

    // 結果が出たらシェアボタン表示
    shareButton.parentElement.style.display = "block";

    isSpinning = false;
}



// 初期化
updateSegments();
resizeCanvas();
userInput.addEventListener('input', updateSegments);
spinButton.addEventListener('click', spin);
