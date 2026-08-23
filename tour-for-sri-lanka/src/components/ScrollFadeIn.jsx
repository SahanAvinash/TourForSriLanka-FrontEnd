import useInView from "../hooks/useInView";

export default function ScrollFadeIn({ children, className = "", style = {}, as = "div" }) {
    const [ref, inView] = useInView();
    const Tag = as;
    return (
        <Tag ref={ref} className={`${className} ${inView ? "in-view" : ""}`} style={style}>
            {children}
        </Tag>
    );
}