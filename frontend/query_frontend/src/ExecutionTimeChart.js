import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const ExecutionTimeChart = ({ data,w=250,h=280,caption="Execution Time", color = '#8884d8' }) => {
  return (
    <div className="execution-time-chart-container">
   
      <BarChart width={w} height={h} data={data}>
        <CartesianGrid strokeDasharray="8" />

        <XAxis dataKey="name" tickFormatter={() => ''} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="value" fill={color} name={caption}/>

      </BarChart>
    </div>
  );
};

export default ExecutionTimeChart;
