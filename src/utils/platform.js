export const isIOS = () => {
    return [
        'iPad Simulator',
        'iPhone Simulator',
        'iPod Simulator',
        'iPad',
        'iPhone',
        'iPod'
    ].includes(navigator.platform)
        // iPad on iOS 13 detection
        || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
}

export const isSafari = () => {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

export const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export const getDeviceName = () => {
    if (isIOS()) return "iOS Device";
    if (/Android/i.test(navigator.userAgent)) return "Android Device";
    if (/Win/i.test(navigator.platform)) return "Windows PC";
    if (/Mac/i.test(navigator.platform)) return "Mac";
    return "Unknown Device";
}
