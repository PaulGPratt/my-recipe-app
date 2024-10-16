import TopNav from "../components/top-nav";
import { format, addMonths } from 'date-fns';


const CURRENT_MONTH_INDEX = 0;

function Plan() {
    const renderMonth = (monthOffset: number) => {
        const date = addMonths(new Date(), monthOffset);
        const monthLabel = format(date, 'MMMM yyyy');

        return (
            <div key={monthOffset}>
                {monthLabel}
            </div>
        );
    };

    return (
        <div className="h-full mx-auto max-w-4xl">
            <TopNav></TopNav>
            <div className="px-4 pb-4 flex flex-col gap-2">
                <div>
                    {renderMonth(CURRENT_MONTH_INDEX - 1)}
                </div>
                <div>
                    {renderMonth(CURRENT_MONTH_INDEX)}
                </div>
                <div>
                    {renderMonth(CURRENT_MONTH_INDEX + 1)}
                </div>

            </div>
        </div>
    );
}

export default Plan;