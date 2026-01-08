// 全局变量
let wordList = [];
let currentIndex = 0;
let isPlaying = false;
let isAnswered = false;
let answerStatus = []; // 存储每个单词的回答状态：0-未回答，1-正确，2-错误

// DOM 元素
const wordListInput = document.getElementById('wordList');
const startBtn = document.getElementById('startBtn');
const playBtn = document.getElementById('playBtn');
const submitBtn = document.getElementById('submitBtn');
const answerInput = document.getElementById('answerInput');
const statusDisplay = document.getElementById('status');
const wordListContainer = document.getElementById('wordListContainer');

// 初始化事件监听器
function initEventListeners() {
    startBtn.addEventListener('click', startDictation);
    playBtn.addEventListener('click', playCurrentWord);
    submitBtn.addEventListener('click', checkAnswer);
    // 添加回车键提交
    answerInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkAnswer();
        }
    });
    // 添加单词列表输入框的回车键事件
    wordListInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            startDictation();
        }
    });
}

// 开始听写
function startDictation() {
    // 解析输入的单词列表
    const inputText = wordListInput.value.trim();
    if (!inputText) {
        alert('请输入要听写的单词或短语！');
        return;
    }
    
    // 解析并清理单词列表
    wordList = inputText.split(',').map(word => word.trim()).filter(word => word.length > 0);
    
    if (wordList.length === 0) {
        alert('请输入有效的单词或短语！');
        return;
    }
    
    // 重置状态
    currentIndex = 0;
    isAnswered = false;
    answerStatus = new Array(wordList.length).fill(0); // 初始化所有单词为未回答状态
    
    // 渲染单词列表
    renderWordList();
    
    // 更新UI状态
    startBtn.disabled = true;
    playBtn.disabled = false;
    submitBtn.disabled = false;
    answerInput.disabled = false;
    answerInput.value = '';
    isAnswered = false;
    
    // 清空单词列表输入框
    wordListInput.value = '';
    
    // 光标自动定位到答案输入框
    answerInput.focus();
    
    // 播放第一个单词
    playCurrentWord();
}

// 渲染单词列表
function renderWordList() {
    wordListContainer.innerHTML = '';
    
    // 重新组织单词列表的显示顺序
    // 已完成的单词显示在前面，按照完成顺序
    // 当前单词显示在中间
    // 未完成的单词显示在后面
    
    // 渲染已完成的单词（从最后一个完成的开始，倒序渲染）
    for (let i = currentIndex - 1; i >= 0; i--) {
        const word = wordList[i];
        const li = document.createElement('li');
        li.className = 'word-item completed';
        
        // 根据回答状态设置样式
        if (answerStatus[i] === 1) {
            // 正确
            li.style.backgroundColor = '#d4edda'; // 绿色
            li.style.borderLeft = '4px solid #28a745'; // 绿色左边框
        } else if (answerStatus[i] === 2) {
            // 错误
            li.style.backgroundColor = '#f8d7da'; // 红色
            li.style.borderLeft = '4px solid #dc3545'; // 红色左边框
            li.style.color = '#721c24'; // 红色字体
        }
        
        li.textContent = word;
        wordListContainer.appendChild(li);
    }
    
    // 渲染当前单词
    if (currentIndex < wordList.length) {
        const word = wordList[currentIndex];
        const li = document.createElement('li');
        li.className = 'word-item current';
        
        // 只有在回答后才显示当前单词
        if (!isAnswered) {
            li.classList.add('hidden');
        } else {
            // 根据回答状态设置样式
            if (answerStatus[currentIndex] === 1) {
                // 正确
                li.style.backgroundColor = '#d4edda'; // 绿色
                li.style.borderLeft = '4px solid #28a745'; // 绿色左边框
            } else if (answerStatus[currentIndex] === 2) {
                // 错误
                li.style.backgroundColor = '#f8d7da'; // 红色
                li.style.borderLeft = '4px solid #dc3545'; // 红色左边框
                li.style.color = '#721c24'; // 红色字体
            }
        }
        
        li.textContent = word;
        wordListContainer.appendChild(li);
    }
    
    // 渲染未完成的单词
    for (let i = currentIndex + 1; i < wordList.length; i++) {
        const word = wordList[i];
        const li = document.createElement('li');
        li.className = 'word-item hidden';
        li.textContent = word;
        wordListContainer.appendChild(li);
    }
}

// 播放当前单词
function playCurrentWord() {
    if (currentIndex >= wordList.length) {
        statusDisplay.textContent = '听写完成！';
        return;
    }
    
    const currentWord = wordList[currentIndex];
    statusDisplay.textContent = '正在播放...';
    
    // 使用 Web Speech API 播放语音
    if ('speechSynthesis' in window) {
        // 第一次播放
        const utterance1 = new SpeechSynthesisUtterance(currentWord);
        utterance1.lang = 'en-US';
        utterance1.rate = 1.0;
        utterance1.pitch = 1.0;
        utterance1.volume = 1.0;
        
        speechSynthesis.speak(utterance1);
        
        utterance1.onend = function() {
            // 间隔0.5秒后第二次播放
            setTimeout(function() {
                const utterance2 = new SpeechSynthesisUtterance(currentWord);
                utterance2.lang = 'en-US';
                utterance2.rate = 1.0;
                utterance2.pitch = 1.0;
                utterance2.volume = 1.0;
                
                speechSynthesis.speak(utterance2);
                
                utterance2.onend = function() {
                    statusDisplay.textContent = '请输入您听到的单词或短语';
                };
                
                utterance2.onerror = function() {
                    statusDisplay.textContent = '语音播放失败，请重试';
                };
            }, 500); // 0.5秒间隔
        };
        
        utterance1.onerror = function() {
            statusDisplay.textContent = '语音播放失败，请重试';
        };
    } else {
        statusDisplay.textContent = '您的浏览器不支持语音合成';
    }
}

// 检查回答
function checkAnswer() {
    if (currentIndex >= wordList.length) {
        return;
    }
    
    const userAnswer = answerInput.value.trim().toLowerCase();
    const currentWord = wordList[currentIndex].toLowerCase();
    
    // 判断回答是否正确
    if (userAnswer === currentWord) {
        // 回答正确
        statusDisplay.textContent = '回答正确！';
        // 存储回答状态
        answerStatus[currentIndex] = 1; // 1表示正确
    } else {
        // 回答错误
        statusDisplay.textContent = '回答错误！';
        // 存储回答状态
        answerStatus[currentIndex] = 2; // 2表示错误
    }
    
    // 标记为已回答
    isAnswered = true;
    
    // 显示当前单词
    renderWordList();
    
    // 禁用提交按钮
    submitBtn.disabled = true;
    
    // 延迟1秒后自动进入下一个单词
    setTimeout(function() {
        nextWord();
    }, 1000);
}

// 下一个单词
function nextWord() {
    currentIndex++;
    
    if (currentIndex >= wordList.length) {
        // 听写完成
        // 计算统计信息
        const totalWords = wordList.length;
        const correctCount = answerStatus.filter(status => status === 1).length;
        const wrongCount = answerStatus.filter(status => status === 2).length;
        const score = Math.round((correctCount / totalWords) * 100);
        
        // 显示统计信息
        statusDisplay.textContent = `听写完成！\n共听写 ${totalWords} 个单词短语\n答对 ${correctCount} 个\n答错 ${wrongCount} 个\n得分：${score} 分`;
        
        playBtn.disabled = true;
        submitBtn.disabled = true;
        answerInput.disabled = true;
        startBtn.disabled = false;
        
        // 更新所有单词为已完成状态
        renderWordList();
    } else {
        // 重置回答状态
        isAnswered = false;
        answerInput.value = '';
        playBtn.disabled = false;
        submitBtn.disabled = false;
        
        // 播放下一个单词
        renderWordList();
        playCurrentWord();
    }
}

// 初始化应用
function initApp() {
    initEventListeners();
    statusDisplay.textContent = '准备就绪';
}

// 启动应用
initApp();