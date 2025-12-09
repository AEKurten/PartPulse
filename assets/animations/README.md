# Lottie Animations

Place your Lottie JSON animation files in this directory.

## How to use:

1. Download or create a Lottie animation file (`.json` format)
2. Place it in this `assets/animations/` directory
3. Reference it in your component:

```tsx
import LottieView from 'lottie-react-native';

<LottieView
  source={require('@/assets/animations/your-animation.json')}
  autoPlay
  loop
  style={{ width: 256, height: 256 }}
/>
```

## Getting Lottie Files:

- [LottieFiles.com](https://lottiefiles.com/) - Free Lottie animations
- Export from After Effects using Bodymovin plugin
- Create your own using LottieFiles Animator

## Example for GPU animation:

The welcome screen expects: `assets/animations/gpu-animation.json`

You can find PC/GPU related animations on LottieFiles by searching for:
- "computer"
- "gpu"
- "graphics card"
- "pc parts"
- "technology"

