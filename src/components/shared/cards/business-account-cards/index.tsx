import { BusinessAccountCard } from "../business-account-card";
export const BusinessAccountCards = () => {
  return (
    <div className="grid grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map(() => (
        <BusinessAccountCard />
      ))}
    </div>
  );
};
