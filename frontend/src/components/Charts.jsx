import { useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, ComposedChart } from 'recharts';

export const SimpleLineChart = ({ data, title, dataKey, color = '#3b82f6' }) => {
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload[0]) {
      return (
        <div className="bg-gray-900 p-3 rounded-lg border border-gray-700 text-white text-sm">
          <p className="font-semibold">{payload[0].payload.date || 'Revenue'}</p>
          <p className="text-gray-300">Revenue: <span className="text-green-400">₱{payload[0].value.toLocaleString('en-US', {minimumFractionDigits: 2})}</span></p>
          {payload[0].payload.transactions && <p className="text-gray-300">Transactions: <span className="text-blue-400">{payload[0].payload.transactions}</span></p>}
        </div>
      );
    }
    return null;
  };

  // Diagonal label if too many data points
  const angle = data && data.length > 14 ? -45 : 0;
  const interval = data && data.length > 14 ? 0 : 'preserveEnd';
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} angle={angle} interval={interval} height={angle ? 48 : 24} tick={{ dy: angle ? 16 : 0 }} />
        <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
        <Tooltip content={<CustomTooltip />} />
        <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export const SimpleAreaChart = ({ data, dataKey, color = '#8b5cf6' }) => {
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload[0]) {
      return (
        <div className="bg-gray-900 p-3 rounded-lg border border-gray-700 text-white text-sm">
          <p className="font-semibold">{payload[0].payload.date || 'Transactions'}</p>
          <p className="text-gray-300">Total Transactions: <span className="text-purple-400">{payload[0].value.toLocaleString()}</span></p>
        </div>
      );
    }
    return null;
  };

  // Diagonal label if too many data points
  const angle = data && data.length > 14 ? -45 : 0;
  const interval = data && data.length > 14 ? 0 : 'preserveEnd';
  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
            <stop offset="95%" stopColor={color} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} angle={angle} interval={interval} height={angle ? 48 : 24} tick={{ dy: angle ? 16 : 0 }} />
        <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey={dataKey} stroke={color} fillOpacity={1} fill="url(#colorArea)" />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export const SimpleBarChart = ({ data, dataKey, color = '#10b981', valueType = 'number', valueLabel = 'Value' }) => {
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload[0]) {
      const raw = Number(payload[0].value);
      const formatted = payload[0].payload.displayValue || (
        valueType === 'currency'
          ? `₱${raw.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : raw.toLocaleString()
      );
      return (
        <div className="bg-gray-900 p-3 rounded-lg border border-gray-700 text-white text-sm">
          <p className="font-semibold">{payload[0].payload.label}</p>
          <p className="text-gray-300">{valueLabel}: <span className="text-green-400">{formatted}</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="label" stroke="#9ca3af" style={{ fontSize: '12px' }} />
        <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey={dataKey} fill={color} radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export const SimplePieChart = ({ data, colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'], isDoughnut = false }) => {
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload[0]) {
      return (
        <div className="bg-gray-900 p-3 rounded-lg border border-gray-700 text-white text-sm">
          <p className="font-semibold">{payload[0].name}</p>
          <p className="text-gray-300">Market Share: <span className="text-blue-400">{payload[0].value}%</span></p>
        </div>
      );
    }
    return null;
  };

  // Pass color for each label based on index
  const renderLabel = (props) => {
    const { name, value, cx, cy, midAngle, index } = props;
    const RADIAN = Math.PI / 180;
    const radius = isDoughnut ? 110 : 90;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const color = colors[index % colors.length];

    return (
      <text 
        x={x} 
        y={y} 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        <tspan x={x} dy="0" fill={color}>{name}</tspan>
        <tspan x={x} dy="14" className="font-semibold" fill="#e5e7eb">{value}%</tspan>
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderLabel}
          outerRadius={isDoughnut ? 80 : 80}
          innerRadius={isDoughnut ? 50 : 0}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export const CombinedLineAreaChart = ({
  data,
  lineKey = 'revenue',
  areaKey = 'transactions',
  lineColor = '#3b82f6',
  areaColor = '#f59e0b',
  mode = 'line-area' // 'dual-lines' or 'line-area'
}) => {
  const [showRevenue, setShowRevenue] = useState(true);
  const [showTransactions, setShowTransactions] = useState(true);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const lineEntry = payload.find(p => p.dataKey === lineKey);
      const areaEntry = payload.find(p => p.dataKey === areaKey);
      const date = payload[0]?.payload?.date;

      return (
        <div className="bg-gray-900 p-3 rounded-lg border border-gray-700 text-white text-sm">
          <p className="font-semibold">{date}</p>
          {typeof lineEntry?.value === 'number' && (
            <p className="text-gray-300">Revenue: <span className="text-blue-400">₱{lineEntry.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></p>
          )}
          {typeof areaEntry?.value === 'number' && (
            <p className="text-gray-300">Transactions: <span className="text-amber-400">{areaEntry.value.toLocaleString()}</span></p>
          )}
        </div>
      );
    }
    return null;
  };

  const CustomLegend = () => (
    <div className="flex items-center gap-6 px-2 py-1">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          className="toggle"
          style={{
            backgroundColor: showRevenue ? lineColor : '',
            borderColor: lineColor,
          }}
          checked={showRevenue}
          onChange={() => setShowRevenue(v => !v)}
        />
        <span className="text-sm font-medium">Revenue</span>
      </label>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          className="toggle"
          style={{
            backgroundColor: showTransactions ? areaColor : '',
            borderColor: areaColor,
          }}
          checked={showTransactions}
          onChange={() => setShowTransactions(v => !v)}
        />
        <span className="text-sm font-medium">Transactions</span>
      </label>
    </div>
  );

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="combinedAreaColor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={areaColor} stopOpacity={0.8} />
            <stop offset="95%" stopColor={areaColor} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="combinedRevenueAreaColor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={lineColor} stopOpacity={0.8} />
            <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        {/* Diagonal label if too many data points */}
        <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} angle={data && data.length > 14 ? -45 : 0} interval={data && data.length > 14 ? 0 : 'preserveEnd'} height={data && data.length > 14 ? 48 : 24} tick={{ dy: data && data.length > 14 ? 16 : 0 }} />
        <YAxis yAxisId="left" stroke="#9ca3af" style={{ fontSize: '12px' }} />
        <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" style={{ fontSize: '12px' }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend content={<CustomLegend />} />

        {mode === 'dual-lines'
          ? (
            <>
              {showTransactions && showRevenue && (
                <>
                  <Line yAxisId="left" type="monotone" dataKey={areaKey} stroke={areaColor} strokeWidth={2} dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey={lineKey} stroke={lineColor} strokeWidth={2} dot={false} />
                </>
              )}
              {showTransactions && !showRevenue && (
                <Area yAxisId="left" type="monotone" dataKey={areaKey} stroke={areaColor} fillOpacity={0.7} fill="url(#combinedAreaColor)" />
              )}
              {showRevenue && !showTransactions && (
                <Area yAxisId="right" type="monotone" dataKey={lineKey} stroke={lineColor} fillOpacity={0.7} fill="url(#combinedRevenueAreaColor)" />
              )}
            </>
          )
          : (
            <>
              {showTransactions && (
                <Area yAxisId="left" type="monotone" dataKey={areaKey} stroke={areaColor} fillOpacity={1} fill="url(#combinedAreaColor)" />
              )}
              {showRevenue && (
                <Line yAxisId="right" type="monotone" dataKey={lineKey} stroke={lineColor} strokeWidth={2} dot={false} />
              )}
            </>
          )}
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export const HourlyHeatmapChart = ({ data }) => {
  const safeData = data.map(d => ({
    hour: d.hour,
    count: Number(d.count) || 0,
    revenue: Number(d.revenue) || 0,
  }));
  const maxCount = Math.max(1, ...safeData.map(d => d.count));
  const cleanHour = (h) => typeof h === 'string' ? h.replace(':00', '') : h;
  const formatCurrency = (amt) => `₱${Number(amt || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const [hoverInfo, setHoverInfo] = useState(null);
  return (
    <div className="grid grid-cols-12 gap-2 sm:gap-3">
      {safeData.map((hour, idx) => {
        const intensity = maxCount ? (hour.count / maxCount) : 0;
        return (
          <div
            key={idx}
            className="flex flex-col items-center relative p-0.5 sm:p-1"
            onMouseEnter={(e) => setHoverInfo({ idx, x: e.clientX, y: e.clientY })}
            onMouseMove={(e) => setHoverInfo({ idx, x: e.clientX, y: e.clientY })}
            onMouseLeave={() => setHoverInfo(null)}
          >
            <div
              className="w-full aspect-square rounded-md transition-all duration-150 hover:scale-105 hover:ring-2 hover:ring-blue-300/70"
              style={{ backgroundColor: `rgba(59, 130, 246, ${intensity})` }}
            />
            <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">{cleanHour(hour.hour)}</span>
          </div>
        );
      })}
      {hoverInfo && safeData[hoverInfo.idx] && (
        <div
          className="pointer-events-none fixed z-50"
          style={{ left: hoverInfo.x + 12, top: hoverInfo.y + 12 }}
        >
          <div className="bg-gray-900 p-2 rounded-lg border border-gray-700 text-white text-xs shadow-lg whitespace-nowrap">
            <div className="font-semibold">{cleanHour(safeData[hoverInfo.idx].hour)}</div>
            <div className="text-gray-300">Transactions: <span className="text-amber-400">{Number(safeData[hoverInfo.idx].count).toLocaleString()}</span></div>
            <div className="text-gray-300">Revenue: <span className="text-green-400">{formatCurrency(safeData[hoverInfo.idx].revenue)}</span></div>
          </div>
        </div>
      )}
    </div>
  );
};


export const HorizontalBarChart = ({ data, dataKey = 'value', color = '#3b82f6', labelKey = 'label' }) => {
  const totalValue = data.reduce((sum, item) => sum + item[dataKey], 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload[0]) {
      const percentage = ((payload[0].payload[dataKey] / totalValue) * 100).toFixed(1);
      return (
        <div className="bg-gray-900 p-3 rounded-lg border border-gray-700 text-white text-sm">
          <p className="font-semibold">{payload[0].payload[labelKey]}</p>
          <p className="text-gray-300">Value: <span className="text-green-400">{payload[0].payload.displayValue || `₱${Number(payload[0].value).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}</span></p>
          <p className="text-gray-300">Market Share: <span className="text-blue-400">{percentage}%</span></p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = (props) => {
    const { x, y, width, height, value } = props;
    const percentage = ((value / totalValue) * 100).toFixed(1);
    return (
      <text
        x={x + width + 12}
        y={y + height / 2}
        fill="#ffffff"
        textAnchor="start"
        dominantBaseline="middle"
        className="text-sm font-bold"
        fontSize="13"
      >
        {percentage}%
      </text>
    );
  };

  return (
    <div className="w-full flex justify-center">
      <ResponsiveContainer width="100%" height={Math.max(300, data.length * 40)}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 40, left: 70, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis type="number" stroke="#9ca3af" style={{ fontSize: '12px' }} />
          <YAxis dataKey={labelKey} type="category" stroke="#9ca3af" style={{ fontSize: '11px' }} width={65} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey={dataKey} fill={color} radius={[0, 8, 8, 0]} label={<CustomLabel />} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
