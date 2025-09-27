import Image from "next/image";

export const LogoSection = () => {
  return (
    <div
      style={{
        marginBottom: "24px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
      }}
    >
      <Image
        src="/devRank.png"
        alt="Retix Logo"
        width={120}
        height={120}
        priority
      />
    </div>
  );
};
