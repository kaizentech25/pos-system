import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

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

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
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
        <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
        <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey={dataKey} stroke={color} fillOpacity={1} fill="url(#colorArea)" />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export const SimpleBarChart = ({ data, dataKey, color = '#10b981' }) => {
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload[0]) {
      return (
        <div className="bg-gray-900 p-3 rounded-lg border border-gray-700 text-white text-sm">
          <p className="font-semibold">{payload[0].payload.label}</p>
          <p className="text-gray-300">Value: <span className="text-green-400">{payload[0].payload.displayValue || payload[0].value.toLocaleString()}</span></p>
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

export const SimplePieChart = ({ data, colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'] }) => {
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

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, value }) => `${name}: ${value}%`}
          outerRadius={80}
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

export const HourlyHeatmapChart = ({ data }) => {
  const maxCount = Math.max(...data.map(d => d.count));
  
  return (
    <div className="grid grid-cols-12 gap-1">
      {data.map((hour, idx) => (
        <div key={idx} className="flex flex-col items-center">
          <div
            className="w-full aspect-square rounded-md transition-colors"
            style={{
              backgroundColor: `rgba(59, 130, 246, ${hour.count / maxCount})`,
            }}
            title={`${hour.hour}:00 - ${hour.count} transactions`}
          />
          <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">{hour.hour}</span>
        </div>
      ))}
    </div>
  );
};
