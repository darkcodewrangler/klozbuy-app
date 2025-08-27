export const BusinessAccountCard = () => {
  return (
    <div className="flex flex-col">
      <div className="image-wrapper">
        <img
          src="/business-account-placeholder.png"
          alt="Business Account"
          className="w-full h-auto rounded-lg"
        />
      </div>
      <div className="mt-2">
        <h3 className="text-lg font-semibold">Business Account</h3>
        <p className="text-sm text-muted-foreground">
          Manage your business profile
        </p>
      </div>
    </div>
  );
};
