import * as React from "react"

export interface LinkProps extends React.ComponentPropsWithoutRef<"a"> {
  href: string
  asChild?: boolean
  children?: React.ReactNode
}

export default function Link({ href, asChild, children, className, onClick, ...rest }: LinkProps) {
  const { asChild: _ignored, ...props } = rest as any

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      onClick(e)
    }
    if (href && (href.startsWith("#") || href.startsWith("/"))) {
      e.preventDefault()
      window.location.hash = href
      window.dispatchEvent(new HashChangeEvent("hashchange"))
    }
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      href,
      onClick: handleClick,
      className: `${className || ""} ${(children as any).props?.className || ""}`.trim(),
      ...props,
    })
  }

  return (
    <a href={href} onClick={handleClick} className={className} {...props}>
      {children}
    </a>
  )
}
