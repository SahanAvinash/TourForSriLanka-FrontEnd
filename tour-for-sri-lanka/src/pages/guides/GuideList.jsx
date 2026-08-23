import { API_BASE_URL } from "../../config/api";
import { useEffect, useRef, useState } from "react";
import GuideCard from "./GuideCard";

function useInView(threshold = 0.15) {
const ref = useRef(null)
const [inView, setInView] = useState(false)

useEffect(() => {
const el = ref.current
if (!el) return
const observer = new IntersectionObserver(
            ([entry]) => {
if (entry.isIntersecting) {
setInView(true)
observer.unobserve(el)
                }
            },
            { threshold }
        )
observer.observe(el)
return () => observer.disconnect()
    }, [])

return [ref, inView]
}

function AnimatedGuideCard({ guide, index }) {
const [ref, inView] = useInView()
return (
<div
ref={ref}
className={`category-card-anim ${inView ? "in-view" : ""}`}
style={{ animationDelay: inView ? `${index * 60}ms` : undefined }}
>
<GuideCard guide={guide} />
</div>
    )
}

const GuideList = ({ filters }) => {
const [guides, setGuides] = useState([])
const [loading, setLoading] = useState(true)

const sectionRef = useRef(null)
const isFirstRender = useRef(true)

const isSearching = filters && (filters.district || filters.language)

useEffect(() => {
setLoading(true)

const params = new URLSearchParams()
if(filters?.district) params.append("district", filters.district)
if(filters?.language) params.append("language", filters.language)

const url = `${API_BASE_URL}/api/guide/?${params.toString()}`

fetch(url)
            .then((res) => res.json())
            .then((data) => {
setGuides(data)
setLoading(false)
            })
            .catch((error) => {
console.log(error)
setLoading(false)
            })
    }, [filters])

useEffect(() => {
if (isFirstRender.current) {
isFirstRender.current = false
return
        }
if (isSearching && sectionRef.current) {
sectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
        }
    }, [filters])

return (
<section ref={sectionRef} className="px-8 pb-16 bg-[#11212D]">
<div className="max-w-7xl mx-auto">

<div className="flex justify-between items-center mb-8">
<div>
<h2 className="text-3xl font-bold text-white">
{isSearching ? "Search Result" : "Meet Our Guides"}
</h2>
<p className="text-gray-400 mt-2">
{isSearching
                                ? "Guides matching your search"
                                : "Explore experienced local guides across Sri Lanka"
}
</p>
</div>
</div>

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
{loading ? (
<p className="text-gray-400 col-span-full text-center">Loading guides...</p>
                    ) : guides.length === 0 ? (
<p className="text-gray-400 col-span-full text-center">
{isSearching ? "No guides match your search" : "No guides found"}
</p>
                    ) : (
guides.map((guide, index) => (
<AnimatedGuideCard key={guide._id} guide={guide} index={index} />
                        ))
                    )}
</div>

</div>
</section>
    );
};

export default GuideList;