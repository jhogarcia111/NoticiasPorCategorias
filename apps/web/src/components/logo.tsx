interface LogoProps {
  variant?: "icon" | "horizontal"
  size?: number
  className?: string
  white?: boolean
}

const colors = {
  c1l: "#0A66C2",
  c1r: "#0055A4",
  c2l: "#0055A4",
  c2r: "#003E7A",
  c3l: "#003E7A",
  c3r: "#002A5C",
  arrow: "#1DB954",
}

const whiteColors = {
  c1l: "#FFFFFF",
  c1r: "#E5F0FA",
  c2l: "#E5F0FA",
  c2r: "#B3D4F0",
  c3l: "#B3D4F0",
  c3r: "#80BBE0",
  arrow: "#1DB954",
}

export function Logo({ variant = "icon", size = 40, className, white }: LogoProps) {
  const c = white ? whiteColors : colors

  if (variant === "horizontal") {
    return (
      <img
        src="/logo-horizontal.svg"
        alt="NoticiasPorCategorías"
        className={className}
        style={{ height: size }}
      />
    )
  }

  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      style={{ height: size, width: "auto" }}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M 50 50 L 200 110 L 350 50 L 350 80 L 200 140 L 50 80 Z" fill={c.c1l} />
      <path d="M 200 110 L 350 50 L 350 80 L 200 140 Z" fill={c.c1r} />
      <path d="M 95 120 L 200 175 L 200 203 L 95 148 Z" fill={c.c2l} />
      <path d="M 200 175 L 305 120 L 305 148 L 200 203 Z" fill={c.c2r} />
      <path d="M 135 185 L 200 230 L 200 255 L 135 210 Z" fill={c.c3l} />
      <path d="M 200 230 L 265 185 L 265 210 L 200 255 Z" fill={c.c3r} />
      <path d="M 200 260 L 260 310 L 220 310 L 220 350 L 180 350 L 180 310 L 140 310 Z" fill={c.arrow} />
    </svg>
  )
}
