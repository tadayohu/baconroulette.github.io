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
const colorPalette = ["#FF6B6B","#6BCB77","#4D96FF","#FFD93D","#FF6EC7","#6A4C93","#FF9F1C","#2EC4B6"];

// Canvasリサイズ関数（レスポンシブ対応）
function resizeCanvas() {
    const size = Math.min(window.innerWidth * 0.9, 400);
    canvas.width = size;
    canvas.height = size;
    drawRoulette();
}
window.addEventListener('resize', resizeCanvas);

// 矢印描画
function drawArrow() {
    const arrowSize = canvas.width * 0.03;
    const cx = canvas.width / 2;
    ctx.fillStyle = "#ffcc00";
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx - arrowSize / 2, arrowSize);
    ctx.lineTo(cx + arrowSize / 2, arrowSize);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

// ルーレット描画
function drawRoulette() {
    if (segments.length === 0) return;
    const arc = (2 * Math.PI) / segments.length;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 中央グラデーション
    const gradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, canvas.width/2);
    gradient.addColorStop(0, "#fff");
    gradient.addColorStop(0.1, "#ddd");
    gradient.addColorStop(1, "#444");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(canvas.width/2, canvas.height/2, canvas.width/2, 0, 2*Math.PI);
    ctx.fill();

    // セグメント描画
    for (let i = 0; i < segments.length; i++) {
        const angle = startAngle + i * arc;
        ctx.fillStyle = colors[i % colors.length];
        ctx.beginPath();
        ctx.moveTo(canvas.width/2, canvas.height/2);
        ctx.arc(canvas.width/2, canvas.height/2, canvas.width/2, angle, angle + arc);
        ctx.fill();

        // テキスト中央配置
        ctx.save();
        ctx.fillStyle = "#fff";
        ctx.font = `${Math.floor(canvas.width/15)}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const textAngle = angle + arc/2;
        const radius = canvas.width/2 * 0.65;
        const x = canvas.width/2 + Math.cos(textAngle) * radius;
        const y = canvas.height/2 + Math.sin(textAngle) * radius;
        ctx.translate(x, y);
        ctx.rotate(textAngle + Math.PI/2);
        ctx.fillText(segments[i], 0, 0);
        ctx.restore();
    }

    drawArrow();
}

// easing関数
function easeInOut(t, b, c, d) {
    t /= d/2;
    if (t < 1) return c/2*t*t + b;
    t--;
    return -c/2*(t*(t-2)-1) + b;
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
    const normalized = (startAngle % (2*Math.PI) + 2*Math.PI) % (2*Math.PI);
    const angleFromArrow = (normalized + Math.PI/2) % (2*Math.PI);
    let index = Math.floor(segments.length - angleFromArrow / (2*Math.PI) * segments.length) % segments.length;
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
    const normalized = (startAngle % (2*Math.PI) + 2*Math.PI) % (2*Math.PI);
    const angleFromArrow = (normalized + Math.PI/2) % (2*Math.PI);
    let index = Math.floor(segments.length - angleFromArrow / (2*Math.PI) * segments.length) % segments.length;
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
