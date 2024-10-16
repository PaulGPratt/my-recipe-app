import { useState, useEffect, useRef } from 'react';
import TopNav from "../components/top-nav";
import { format, addMonths } from 'date-fns';
import { ScrollArea } from '../components/ui/scroll-area';

const CURRENT_MONTH_INDEX = 0;

function Calendar() {
    const [monthOffsets, setMonthOffsets] = useState<number[]>([
        CURRENT_MONTH_INDEX - 1,
        CURRENT_MONTH_INDEX,
        CURRENT_MONTH_INDEX + 1
    ]);
    const botObserverRef = useRef<IntersectionObserver | null>(null);
    const botMonthRef = useRef<HTMLDivElement | null>(null);

    const topObserverRef = useRef<IntersectionObserver | null>(null);
    const topMonthRef = useRef<HTMLDivElement | null>(null);

    const renderMonth = (monthOffset: number) => {
        const date = addMonths(new Date(), monthOffset);
        const monthLabel = format(date, 'MMMM yyyy');

        return monthLabel;
    };

    useEffect(() => {
        // Clean up any previous observer instance when the effect runs again
        if (botObserverRef.current && botMonthRef.current) {
            botObserverRef.current.unobserve(botMonthRef.current);
        }

        if (topObserverRef.current && topMonthRef.current) {
            topObserverRef.current.unobserve(topMonthRef.current);
        }

        // Create a new IntersectionObserver instance if not already created
        botObserverRef.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                // When the last month comes into view, load the next month
                setMonthOffsets((prev) => [
                    ...prev,
                    prev[prev.length - 1] + 1
                ]);
            }
        });

        topObserverRef.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                // When the last month comes into view, load the next month
                setMonthOffsets((prev) => [
                    prev[0] - 1,
                    ...prev,
                ]);
            }
        });
        

        // Attach the observer to the new last month in the list
        if (botMonthRef.current) {
            botObserverRef.current.observe(botMonthRef.current);
        }

        if (topMonthRef.current) {
            topObserverRef.current.observe(topMonthRef.current);
        }

        // Clean up when the component unmounts or the effect runs again
        return () => {
            if (botObserverRef.current && botMonthRef.current) {
                botObserverRef.current.unobserve(botMonthRef.current);
            }
            if (topObserverRef.current && topMonthRef.current) {
                topObserverRef.current.unobserve(topMonthRef.current);
            }
        };
    }, [monthOffsets]); // Re-run effect when monthOffsets changes

    return (
        <div className="h-full mx-auto max-w-4xl flex flex-col">
            <TopNav></TopNav>
            <ScrollArea className="h-full w-full">
                <div className="px-4 gap-2 flex flex-col">
                    {monthOffsets.map((offset, index) => {
                        if (index === monthOffsets.length - 1) {
                            // Attach the last month to the observer via ref
                            return (
                                <div ref={botMonthRef} key={offset}>
                                    {renderMonth(offset)}
                                </div>
                            );
                        }
                        return (
                            <div key={offset}>
                                {renderMonth(offset)}
                            </div>
                        )
                    })}
                </div>
            </ScrollArea>
        </div>
    );
}

export default Calendar;
