import React from 'react';
import { motion } from 'framer-motion';
import ReactECharts from 'echarts-for-react';

const ChartsSection = ({ results }) => {
  // Balance Over Time Chart
  const balanceChartOption = {
    backgroundColor: '#ffffff',
    grid: {
      left: '12%',
      right: '8%',
      top: '20%',
      bottom: '20%',
      containLabel: true
    },
    title: {
      text: 'Loan Balance Over Time',
      left: 'center',
      top: '5%',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#374151'
      }
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: { color: '#374151' },
      formatter: function(params) {
        const payment = results.optimizedSchedule[params[0].dataIndex] || {};
        const originalPayment = results.originalSchedule[params[0].dataIndex] || {};
        const date = payment.date ? new Date(payment.date).toLocaleDateString() : '';
        
        return `
          <div style="padding: 4px 8px;">
            <div style="font-weight: bold; margin-bottom: 5px;">Payment #${payment.paymentNumber || ''} (${date})</div>
            ${params.map(param => 
              `<div style="display: flex; justify-content: space-between; margin: 3px 0;">
                <span style="color: ${param.color};">● ${param.seriesName}:</span>
                <span style="font-weight: bold; margin-left: 12px;">$${param.value?.toLocaleString() || 0}</span>
              </div>`
            ).join('')}
            ${payment.extraPayment ? 
              `<div style="margin-top: 5px; padding-top: 5px; border-top: 1px dashed #e5e7eb;">
                <div style="color: #22c55e; display: flex; justify-content: space-between;">
                  <span>Extra Payment:</span>
                  <span style="font-weight: bold; margin-left: 12px;">$${payment.extraPayment.toLocaleString()}</span>
                </div>
              </div>` : ''}
          </div>
        `;
      }
    },
    legend: {
      data: ['Original Schedule', 'Optimized Schedule'],
      bottom: '5%',
      left: 'center',
      textStyle: {
        fontSize: 12,
        color: '#6b7280'
      },
      icon: 'roundRect',
      itemWidth: 14,
      itemHeight: 8,
      itemGap: 20
    },
    xAxis: {
      type: 'category',
      data: results.originalSchedule.map((_, index) => {
        const year = Math.floor(index / 12);
        return year % 2 === 0 ? `Year ${year}` : '';
      }),
      axisLabel: {
        fontSize: 11,
        color: '#6b7280',
        interval: 0
      },
      axisLine: {
        lineStyle: { color: '#e5e7eb' }
      },
      axisTick: {
        alignWithLabel: true,
        lineStyle: { color: '#e5e7eb' }
      },
      splitLine: {
        show: true,
        lineStyle: { color: '#f3f4f6', type: 'dashed' }
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: function(value) {
          return '$' + (value / 1000).toFixed(0) + 'K';
        },
        fontSize: 11,
        color: '#6b7280'
      },
      axisLine: {
        lineStyle: { color: '#e5e7eb' }
      },
      splitLine: {
        lineStyle: { color: '#f3f4f6' }
      }
    },
    series: [
      {
        name: 'Original Schedule',
        type: 'line',
        data: results.originalSchedule.map(payment => payment.balance),
        smooth: true,
        lineStyle: {
          color: '#ef4444',
          width: 3
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(239,68,68,0.3)' },
              { offset: 1, color: 'rgba(239,68,68,0.05)' }
            ]
          }
        },
        symbol: 'none',
        emphasis: {
          focus: 'series',
          lineStyle: { width: 4 }
        }
      },
      {
        name: 'Optimized Schedule',
        type: 'line',
        data: results.optimizedSchedule.map(payment => payment.balance),
        smooth: true,
        lineStyle: {
          color: '#22c55e',
          width: 3
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(34,197,94,0.3)' },
              { offset: 1, color: 'rgba(34,197,94,0.05)' }
            ]
          }
        },
        symbol: 'none',
        emphasis: {
          focus: 'series',
          lineStyle: { width: 4 }
        }
      }
    ],
    // Enhanced visual elements
    graphic: [
      {
        type: 'text',
        left: '50%',
        top: '92%',
        style: {
          text: 'Hover over chart for detailed payment information',
          textAlign: 'center',
          fill: '#9ca3af',
          fontSize: 10
        }
      }
    ]
  };

  // Principal vs Interest Chart
  const paymentBreakdownOption = {
    backgroundColor: '#ffffff',
    grid: {
      left: '12%',
      right: '8%',
      top: '20%',
      bottom: '25%',
      containLabel: true
    },
    title: {
      text: 'Monthly Payment Breakdown',
      left: 'center',
      top: '5%',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#374151'
      }
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: { color: '#374151' },
      formatter: function(params) {
        const index = params[0].dataIndex;
        const payment = results.optimizedSchedule[index] || {};
        const date = payment.date ? new Date(payment.date).toLocaleDateString() : '';
        const totalPayment = (payment.principal || 0) + (payment.interest || 0) + (payment.extraPayment || 0);
        
        return `
          <div style="padding: 4px 8px;">
            <div style="font-weight: bold; margin-bottom: 5px;">Payment #${payment.paymentNumber || ''} (${date})</div>
            ${params.map(param => 
              `<div style="display: flex; justify-content: space-between; margin: 3px 0;">
                <span style="color: ${param.color};">● ${param.seriesName}:</span>
                <span style="font-weight: bold; margin-left: 12px;">$${param.value?.toLocaleString() || 0}</span>
              </div>`
            ).join('')}
            <div style="margin-top: 5px; padding-top: 5px; border-top: 1px dashed #e5e7eb;">
              <div style="display: flex; justify-content: space-between;">
                <span>Total Payment:</span>
                <span style="font-weight: bold; margin-left: 12px;">$${totalPayment.toLocaleString()}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span>Remaining Balance:</span>
                <span style="font-weight: bold; margin-left: 12px;">$${payment.balance?.toLocaleString() || 0}</span>
              </div>
            </div>
          </div>
        `;
      }
    },
    legend: {
      data: ['Principal', 'Interest', 'Extra Payment'],
      bottom: '5%',
      left: 'center',
      textStyle: {
        fontSize: 12,
        color: '#6b7280'
      },
      icon: 'roundRect',
      itemWidth: 14,
      itemHeight: 8,
      itemGap: 20
    },
    xAxis: {
      type: 'category',
      data: results.optimizedSchedule.slice(0, 60).map((_, index) => {
        const month = index + 1;
        return month % 6 === 1 ? `Month ${month}` : '';
      }),
      axisLabel: {
        fontSize: 11,
        color: '#6b7280',
        interval: 0,
        rotate: 45
      },
      axisLine: {
        lineStyle: { color: '#e5e7eb' }
      },
      axisTick: {
        alignWithLabel: true,
        lineStyle: { color: '#e5e7eb' }
      },
      splitLine: {
        show: true,
        lineStyle: { color: '#f3f4f6', type: 'dashed' }
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '${value}',
        fontSize: 11,
        color: '#6b7280'
      },
      axisLine: {
        lineStyle: { color: '#e5e7eb' }
      },
      splitLine: {
        lineStyle: { color: '#f3f4f6' }
      }
    },
    series: [
      {
        name: 'Principal',
        type: 'bar',
        stack: 'payment',
        data: results.optimizedSchedule.slice(0, 60).map(payment => payment.principal),
        color: '#3b82f6',
        barMaxWidth: 8,
        emphasis: {
          focus: 'series',
          itemStyle: { shadowBlur: 10, shadowColor: 'rgba(59,130,246,0.5)' }
        }
      },
      {
        name: 'Interest',
        type: 'bar',
        stack: 'payment',
        data: results.optimizedSchedule.slice(0, 60).map(payment => payment.interest),
        color: '#ef4444',
        barMaxWidth: 8,
        emphasis: {
          focus: 'series',
          itemStyle: { shadowBlur: 10, shadowColor: 'rgba(239,68,68,0.5)' }
        }
      },
      {
        name: 'Extra Payment',
        type: 'bar',
        stack: 'payment',
        data: results.optimizedSchedule.slice(0, 60).map(payment => payment.extraPayment || 0),
        color: '#22c55e',
        barMaxWidth: 8,
        emphasis: {
          focus: 'series',
          itemStyle: { shadowBlur: 10, shadowColor: 'rgba(34,197,94,0.5)' }
        }
      }
    ],
    // Enhanced visual elements
    graphic: [
      {
        type: 'text',
        left: '50%',
        top: '92%',
        style: {
          text: 'First 60 monthly payments shown • Hover for details',
          textAlign: 'center',
          fill: '#9ca3af',
          fontSize: 10
        }
      }
    ]
  };

  // New chart: Interest vs Principal Distribution
  const interestVsPrincipalOption = {
    backgroundColor: '#ffffff',
    title: {
      text: 'Payment Distribution Over Time',
      left: 'center',
      top: '5%',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#374151'
      },
      subtext: 'How your payments are allocated throughout the loan term',
      subtextStyle: {
        color: '#6b7280',
        fontSize: 12
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      formatter: function(params) {
        // Get the year number
        const yearIndex = params[0].dataIndex;
        const yearNumber = yearIndex + 1;
        
        // Calculate total for this year
        let totalPrincipal = 0;
        let totalInterest = 0;
        let totalExtra = 0;
        
        params.forEach(param => {
          if (param.seriesName === 'Principal') totalPrincipal = param.value;
          if (param.seriesName === 'Interest') totalInterest = param.value;
          if (param.seriesName === 'Extra Payments') totalExtra = param.value;
        });
        
        const totalPayment = totalPrincipal + totalInterest + totalExtra;
        
        return `
          <div style="padding: 4px 8px;">
            <div style="font-weight: bold; margin-bottom: 5px;">Year ${yearNumber}</div>
            <div style="display: flex; justify-content: space-between; margin: 3px 0;">
              <span style="color: #3b82f6;">● Principal:</span>
              <span style="font-weight: bold; margin-left: 12px;">$${totalPrincipal.toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin: 3px 0;">
              <span style="color: #ef4444;">● Interest:</span>
              <span style="font-weight: bold; margin-left: 12px;">$${totalInterest.toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin: 3px 0;">
              <span style="color: #22c55e;">● Extra:</span>
              <span style="font-weight: bold; margin-left: 12px;">$${totalExtra.toLocaleString()}</span>
            </div>
            <div style="margin-top: 5px; padding-top: 5px; border-top: 1px dashed #e5e7eb;">
              <div style="display: flex; justify-content: space-between;">
                <span>Total:</span>
                <span style="font-weight: bold; margin-left: 12px;">$${totalPayment.toLocaleString()}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-top: 3px;">
                <span>Principal %:</span>
                <span style="font-weight: bold; margin-left: 12px;">${((totalPrincipal / totalPayment) * 100).toFixed(1)}%</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-top: 3px;">
                <span>Interest %:</span>
                <span style="font-weight: bold; margin-left: 12px;">${((totalInterest / totalPayment) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        `;
      }
    },
    legend: {
      data: ['Principal', 'Interest', 'Extra Payments'],
      bottom: '5%',
      left: 'center',
      textStyle: {
        fontSize: 12,
        color: '#6b7280'
      }
    },
    grid: {
      left: '12%',
      right: '8%',
      top: '20%',
      bottom: '20%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: Array.from({length: Math.ceil(results.optimizedSchedule.length / 12)}, (_, i) => `Year ${i+1}`),
      axisLabel: {
        fontSize: 11,
        color: '#6b7280'
      }
    },
    yAxis: {
      type: 'value',
      name: 'Amount ($)',
      nameLocation: 'middle',
      nameGap: 40,
      axisLabel: {
        formatter: function(value) {
          if (value >= 1000) {
            return '$' + (value / 1000).toFixed(0) + 'K';
          }
          return '$' + value;
        },
        fontSize: 11,
        color: '#6b7280'
      }
    },
    series: [
      {
        name: 'Principal',
        type: 'bar',
        stack: 'total',
        emphasis: {
          focus: 'series'
        },
        color: '#3b82f6',
        data: calculateYearlyAmounts(results.optimizedSchedule, 'principal')
      },
      {
        name: 'Interest',
        type: 'bar',
        stack: 'total',
        emphasis: {
          focus: 'series'
        },
        color: '#ef4444',
        data: calculateYearlyAmounts(results.optimizedSchedule, 'interest')
      },
      {
        name: 'Extra Payments',
        type: 'bar',
        stack: 'total',
        emphasis: {
          focus: 'series'
        },
        color: '#22c55e',
        data: calculateYearlyAmounts(results.optimizedSchedule, 'extraPayment')
      }
    ]
  };

  // Helper function to calculate yearly amounts
  function calculateYearlyAmounts(schedule, field) {
    const yearlyAmounts = [];
    let currentYear = new Date(schedule[0]?.date).getFullYear();
    let yearSum = 0;
    
    schedule.forEach(payment => {
      const paymentYear = new Date(payment.date).getFullYear();
      
      if (paymentYear !== currentYear) {
        yearlyAmounts.push(Math.round(yearSum));
        yearSum = 0;
        currentYear = paymentYear;
      }
      
      yearSum += payment[field] || 0;
    });
    
    // Add the last year
    yearlyAmounts.push(Math.round(yearSum));
    
    return yearlyAmounts;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <motion.div 
        className="bg-white rounded-xl shadow-soft p-6"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <ReactECharts 
          option={balanceChartOption} 
          style={{ height: '400px', width: '100%' }}
          opts={{ renderer: 'canvas' }}
        />
      </motion.div>
      
      <motion.div 
        className="bg-white rounded-xl shadow-soft p-6"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <ReactECharts 
          option={paymentBreakdownOption} 
          style={{ height: '400px', width: '100%' }}
          opts={{ renderer: 'canvas' }}
        />
      </motion.div>
      
      <motion.div 
        className="bg-white rounded-xl shadow-soft p-6 lg:col-span-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <ReactECharts 
          option={interestVsPrincipalOption} 
          style={{ height: '400px', width: '100%' }}
          opts={{ renderer: 'canvas' }}
        />
      </motion.div>
    </div>
  );
};

export default ChartsSection;