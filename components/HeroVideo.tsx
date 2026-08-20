export default function HeroVideo() {
  return (
    <div className="hero-video-background" aria-hidden="true">
      <video
        className="hero-video"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
      >
        <source src="/videos/iridescent-loop.mp4" type="video/mp4" />
      </video>
    </div>
  )
}
