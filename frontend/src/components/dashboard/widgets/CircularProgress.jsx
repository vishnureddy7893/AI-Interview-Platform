function CircularProgress({ percentage = 65 }) {
  const radius = 82;
  const stroke = 12;

  const normalizedRadius = radius - stroke / 2;

  const circumference =
    normalizedRadius * 2 * Math.PI;

  const strokeDashoffset =
    circumference -
    (percentage / 100) * circumference;

  return (
    <div className="relative h-56 w-56">

      <svg
        height="100%"
        width="100%"
        className="-rotate-90"
      >

        {/* Background */}

        <circle
          stroke="#E5E7EB"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />

        {/* Progress */}

        <circle
          stroke="#16A34A"
          fill="transparent"
          strokeLinecap="round"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="transition-all duration-700"
        />

      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">

        <h1 className="text-6xl font-bold">

          {percentage}%

        </h1>

        <p className="text-gray-500 mt-2">

          Profile Completed

        </p>

      </div>

    </div>
  );
}

export default CircularProgress;