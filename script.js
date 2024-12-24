// DOM elementlarini tanlash
const elements = {
    fromText: document.getElementById('fromText'),
    toText: document.getElementById('toText'),
    fromLanguage: document.getElementById('fromLanguage'),
    toLanguage: document.getElementById('toLanguage'),
    translateBtn: document.getElementById('translateBtn'),
    clearBtn: document.getElementById('clearBtn'),
    copyBtn: document.getElementById('copyBtn'),
    swapBtn: document.getElementById('swapBtn'),
    charCount: document.getElementById('charCount'),
    loadingIndicator: document.getElementById('loadingIndicator'),
    toast: document.getElementById('toast')
};

// Konstanta va konfiguratsiyalar
const CONFIG = {
    MAX_CHARS: 500,
    TOAST_DURATION: 3000,
    API_URL: 'https://api.mymemory.translated.net/get'
};

// Toast xabarlarini ko'rsatish
function showToast(message, type = 'info') {
    const toast = elements.toast;
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, CONFIG.TOAST_DURATION);
}

// Loading holatini boshqarish
function setLoading(isLoading) {
    elements.loadingIndicator.style.display = isLoading ? 'flex' : 'none';
    elements.translateBtn.disabled = isLoading;
}

// Belgilar sonini tekshirish
function updateCharCount() {
    const count = elements.fromText.value.length;
    elements.charCount.textContent = count;
    
    if (count > CONFIG.MAX_CHARS) {
        elements.charCount.classList.add('error');
        elements.translateBtn.disabled = true;
    } else {
        elements.charCount.classList.remove('error');
        elements.translateBtn.disabled = false;
    }
}

// Tarjima funksiyasi
async function translateText() {
    const fromText = elements.fromText.value.trim();
    
    if (!fromText) {
        showToast("Iltimos, tarjima qilish uchun matn kiriting!", 'warning');
        return;
    }

    if (fromText.length > CONFIG.MAX_CHARS) {
        showToast(`Maksimal ${CONFIG.MAX_CHARS} ta belgi kiritish mumkin!`, 'error');
        return;
    }

    setLoading(true);
    elements.toText.value = "";
    
    try {
        const params = new URLSearchParams({
            q: fromText,
            langpair: `${elements.fromLanguage.value}|${elements.toLanguage.value}`
        });

        const response = await fetch(`${CONFIG.API_URL}?${params}`);
        
        if (!response.ok) {
            throw new Error('Tarjima serverida xatolik yuz berdi');
        }

        const data = await response.json();
        
        if (data.responseStatus === 200) {
            elements.toText.value = data.responseData.translatedText;
            showToast("Tarjima muvaffaqiyatli yakunlandi!", 'success');
        } else {
            throw new Error(data.responseDetails || 'Tarjima qilishda xatolik yuz berdi');
        }
    } catch (error) {
        showToast(error.message, 'error');
        elements.toText.value = "";
    } finally {
        setLoading(false);
    }
}

// Tillarni almashtirish
function swapLanguages() {
    // Tillarni almashtirish
    [elements.fromLanguage.value, elements.toLanguage.value] = 
    [elements.toLanguage.value, elements.fromLanguage.value];
    
    // Matnlarni almashtirish
    [elements.fromText.value, elements.toText.value] = 
    [elements.toText.value, elements.fromText.value];
    
    // Belgilar sonini yangilash
    updateCharCount();
}

// Maydonlarni tozalash
function clearFields() {
    elements.fromText.value = "";
    elements.toText.value = "";
    updateCharCount();
    showToast("Barcha maydonlar tozalandi", 'info');
}

// Tarjima natijasidan nusxa olish
async function copyTranslation() {
    const textToCopy = elements.toText.value.trim();
    
    if (!textToCopy) {
        showToast("Nusxa olish uchun tarjima natijasi yo'q!", 'warning');
        return;
    }
    
    try {
        await navigator.clipboard.writeText(textToCopy);
        showToast("Matn muvaffaqiyatli nusxalandi!", 'success');
    } catch (err) {
        showToast("Nusxa olishda xatolik yuz berdi", 'error');
    }
}

// Event listener'larni qo'shish
function initializeEventListeners() {
    // Asosiy tugmalar uchun event listener'lar
    elements.translateBtn.addEventListener('click', translateText);
    elements.clearBtn.addEventListener('click', clearFields);
    elements.copyBtn.addEventListener('click', copyTranslation);
    elements.swapBtn.addEventListener('click', swapLanguages);
    
    // Kiritish maydoni uchun event listener'lar
    elements.fromText.addEventListener('input', updateCharCount);
    elements.fromText.addEventListener('keyup', (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            translateText();
        }
    });

    // Til o'zgarganda avtomatik tarjima
    elements.fromLanguage.addEventListener('change', () => {
        if (elements.fromText.value) {
            translateText();
        }
    });
    
    elements.toLanguage.addEventListener('change', () => {
        if (elements.fromText.value) {
            translateText();
        }
    });
}

// Ilovani ishga tushirish
function initializeApp() {
    updateCharCount();
    initializeEventListeners();
}

// Ilova ishga tushishi
document.addEventListener('DOMContentLoaded', initializeApp);