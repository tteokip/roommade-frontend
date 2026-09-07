const KAKAO_SDK_URL = 'https://t1.kakaocdn.net/kakao_js_sdk/2.8.3/kakao.min.js'

let sdkPromise

function loadKakaoSdk() {
  if (window.Kakao) return Promise.resolve(window.Kakao)
  if (sdkPromise) return sdkPromise

  sdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = KAKAO_SDK_URL
    script.crossOrigin = 'anonymous'
    script.addEventListener('load', () => resolve(window.Kakao), { once: true })
    script.addEventListener('error', () => reject(new Error('Kakao SDK를 불러오지 못했어요.')), {
      once: true,
    })
    document.head.append(script)
  })

  return sdkPromise
}

export async function shareRoomToKakao(file, readinessScore) {
  const javascriptKey = import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY
  if (!javascriptKey) throw new Error('카카오 JavaScript 키가 설정되지 않았어요.')

  const Kakao = await loadKakaoSdk()
  if (!Kakao) throw new Error('Kakao SDK를 초기화하지 못했어요.')
  if (!Kakao.isInitialized()) Kakao.init(javascriptKey)

  const dataTransfer = new DataTransfer()
  dataTransfer.items.add(file)
  const uploadedImage = await Kakao.Share.uploadImage({ file: dataTransfer.files })
  const image = uploadedImage.infos.original
  const configuredUrl = import.meta.env.VITE_PUBLIC_WEB_URL
  const linkUrl = configuredUrl || window.location.origin

  Kakao.Share.sendDefault({
    objectType: 'feed',
    content: {
      title: '룸메이드에서 꾸민 내 방',
      description: `내가 꾸민 나만의 방이에요! 자립 준비도 ${Math.round(readinessScore)}%`,
      imageUrl: image.url,
      imageWidth: image.width,
      imageHeight: image.height,
      link: {
        mobileWebUrl: linkUrl,
        webUrl: linkUrl,
      },
    },
    buttons: [
      {
        title: '내 방 보러 가기',
        link: {
          mobileWebUrl: linkUrl,
          webUrl: linkUrl,
        },
      },
    ],
  })
}
