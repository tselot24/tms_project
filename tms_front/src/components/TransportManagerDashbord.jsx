import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { useSpring, animated } from '@react-spring/web'; // Import react-spring

const Dashboard = () => {
  const barData = [
    { month: 'Jan', lastYear: 30, thisYear: 50 },
    { month: 'Feb', lastYear: 40, thisYear: 60 },
    { month: 'Mar', lastYear: 50, thisYear: 70 },
    { month: 'Apr', lastYear: 20, thisYear: 40 },
    { month: 'May', lastYear: 60, thisYear: 80 },
    { month: 'Jun', lastYear: 30, thisYear: 60 },
    { month: 'Jul', lastYear: 70, thisYear: 90 },
    { month: 'Aug', lastYear: 80, thisYear: 100 },
    { month: 'Sep', lastYear: 60, thisYear: 90 },
    { month: 'Oct', lastYear: 70, thisYear: 100 },
    { month: 'Nov', lastYear: 50, thisYear: 80 },
    { month: 'Dec', lastYear: 60, thisYear: 90 },
  ];

  const pieData = [
    { name: 'Total Service Costs', value: 14 },
    { name: 'Refueling Costs', value: 80 },
    { name: 'Maintenance Costs', value: 22 },
  ];

  const COLORS = ['#FF6384', '#36A2EB', '#FFCE56'];

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize="14px" fontWeight="bold">
        {(percent * 100).toFixed(1)}%
      </text>
    );
  };

  // Animated progress bar function using react-spring
  const ProgressBar = ({ value }) => {
    const props = useSpring({
      width: `${value}%`,
      from: { width: '0%' },
      config: { tension: 200, friction: 20 },
    });

    return <animated.div className="progress-bar" role="progressbar" style={props} aria-valuenow={value} aria-valuemin="0" aria-valuemax="100">{value}%</animated.div>;
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Dashboard Overview</h2>

      <div className="row text-center">
        {['Total Requests', 'Total Active Vehicles', 'Total Vehicles Under Maintenance', 'Total Vehicles Under Service'].map((title, index) => (
          <div className="col-md-3 mb-3" key={index}>
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <h5 className="card-title">{title}</h5>
                <button className="btn btn-primary mt-2">View More</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card shadow-sm border-0 mt-4">
        <div className="card-body">
          <h5 className="card-title">Usage Reports</h5>
          <div className="d-flex justify-content-center">
            <BarChart width={600} height={300} data={barData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="lastYear" fill="#ccc" />
              <Bar dataKey="thisYear" fill="#007bff" />
            </BarChart>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-md-6">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h5 className="card-title">Total Vehicle Use by Department</h5>
              {[{ name: 'IT Infrastructure', value: 30 }, { name: 'Cloud Computing', value: 50 }, { name: 'Computer Networking', value: 20 }].map((dept, index) => (
                <div key={index} className="mb-2">
                  <p className="mb-1">{dept.name} - {dept.value}%</p>
                  <div className="progress">
                    <ProgressBar value={dept.value} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>


        <div className="col-md-6">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h5 className="card-title">Cost Breakdown</h5>
              <div className="d-flex justify-content-center">
                <PieChart width={300} height={300}>
                  <Pie data={pieData} dataKey="value" outerRadius={100} labelLine={false} label={renderCustomizedLabel}>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
