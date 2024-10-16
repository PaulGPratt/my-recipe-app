import { useState, useEffect, useRef } from 'react';
import TopNav from "../components/top-nav";
import { format, addMonths } from 'date-fns';
import { Separator } from '../components/ui/separator';

const CURRENT_MONTH_INDEX = 0;

function Calendar() {
    const [monthOffsets, setMonthOffsets] = useState<number[]>([
        CURRENT_MONTH_INDEX - 1,
        CURRENT_MONTH_INDEX,
        CURRENT_MONTH_INDEX + 1,
        CURRENT_MONTH_INDEX + 2,
        CURRENT_MONTH_INDEX + 3,
        CURRENT_MONTH_INDEX + 4,
        CURRENT_MONTH_INDEX + 5,
    ]);

    const botObserverRef = useRef<IntersectionObserver | null>(null);
    const topObserverRef = useRef<IntersectionObserver | null>(null);

    const monthRefs = useRef<(HTMLDivElement | null)[]>([]);
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);

    const renderMonth = (monthOffset: number) => {
        const date = addMonths(new Date(), monthOffset);
        const monthLabel = format(date, 'MMMM yyyy');
        return monthLabel;
    };

    useEffect(() => {
        // Clean up previous observer instances
        if (botObserverRef.current) {
            monthRefs.current.forEach((ref) => {
                if (ref) botObserverRef.current!.unobserve(ref);
            });
        }

        if (topObserverRef.current) {
            monthRefs.current.forEach((ref) => {
                if (ref) topObserverRef.current!.unobserve(ref);
            });
        }

        // Create new IntersectionObserver instances
        botObserverRef.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                setMonthOffsets((prev) => [
                    ...prev,
                    prev[prev.length - 1] + 1
                ]);
            }
        });

        topObserverRef.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                const scrollContainer = scrollContainerRef.current;
                const firstMonthHeight = monthRefs.current[0]?.getBoundingClientRect().height || 0;
                const previousScrollTop = scrollContainer ? scrollContainer.scrollTop : 0;

                setMonthOffsets((prev) => {
                    const newOffsets = [prev[0] - 1, ...prev];

                    if (scrollContainer) {
                        scrollContainer.scrollTop = previousScrollTop + firstMonthHeight;
                    }

                    return newOffsets;
                });
            }
        });

        // Attach observers to the first and last months
        if (monthRefs.current.length > 0) {
            const firstMonth = monthRefs.current[0];
            const lastMonth = monthRefs.current[monthRefs.current.length - 1];
            if (firstMonth) {
                topObserverRef.current.observe(firstMonth);
            }
            if (lastMonth) {
                botObserverRef.current.observe(lastMonth);
            }
        }

        return () => {
            if (botObserverRef.current) {
                monthRefs.current.forEach((ref) => {
                    if (ref) botObserverRef.current!.unobserve(ref);
                });
            }
            if (topObserverRef.current) {
                monthRefs.current.forEach((ref) => {
                    if (ref) topObserverRef.current!.unobserve(ref);
                });
            }
        };
    }, [monthOffsets]);


    return (
        <div className="h-full mx-auto max-w-4xl flex flex-col">
            <TopNav></TopNav>
            <div className="h-full px-4 overflow-y-scroll no-scrollbar" ref={scrollContainerRef}>
                {monthOffsets.map((offset, index) => (
                        <div
                            className='text-2xl p-2 mb-4 h-24 border'
                            key={offset}
                            ref={(el) => (monthRefs.current[index] = el)}
                        >
                            {renderMonth(offset)}
                        </div>
                ))}
            </div>
        </div>
    );
}

export default Calendar;
