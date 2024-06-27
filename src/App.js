import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#4ade80', '#fbbf24', '#f87171'];

const StickFigure = ({ type }) => {
  const color = type === 'affected' ? 'text-red-500' : (type === 'carrier' ? 'text-yellow-500' : 'text-green-500');
  return (
    <div className={inline-block mx-1 ${color}}>
      {type === 'affected' ? '😞' : (type === 'carrier' ? '😐' : '😊')}
    </div>
  );
};

const getFraction = (decimal) => {
  if (decimal === 0) return '0';
  if (decimal === 1) return '1';
  const tolerance = 1.0E-6;
  let h1 = 1, h2 = 0, k1 = 0, k2 = 1;
  let b = decimal;
  do {
    let a = Math.floor(b);
    let aux = h1; h1 = a * h1 + h2; h2 = aux;
    aux = k1; k1 = a * k1 + k2; k2 = aux;
    b = 1 / (b - a);
  } while (Math.abs(decimal - h1 / k1) > decimal * tolerance);
  return ${h1}/${k1};
};

const parseFraction = (fraction) => {
  const [numerator, denominator] = fraction.split('/').map(Number);
  return numerator / denominator;
};

const ThaiGeneticProbabilityCalculator = () => {
  const [step, setStep] = useState(0);
  const [parent1Fraction, setParent1Fraction] = useState('1/4');
  const [parent2Fraction, setParent2Fraction] = useState('1/4');
  const [outcomes, setOutcomes] = useState({ normal: '0', carrier: '0', affected: '0', bothCarriers: '0', oneCarrier: '0', noCarriers: '0' });

  useEffect(() => {
    calculateOutcomes();
  }, [parent1Fraction, parent2Fraction]);

  const calculateOutcomes = () => {
    const p1 = parseFraction(parent1Fraction);
    const p2 = parseFraction(parent2Fraction);
    const q1 = 1 - p1, q2 = 1 - p2;

    const bothCarriers = p1 * p2;
    const oneCarrier = p1 * q2 + q1 * p2;
    const noCarriers = q1 * q2;

    const affectedProb = bothCarriers * 0.25;
    const carrierProb = (bothCarriers * 0.5) + (oneCarrier * 0.5);
    const normalProb = 1 - affectedProb - carrierProb;

    setOutcomes({
      normal: getFraction(normalProb),
      carrier: getFraction(carrierProb),
      affected: getFraction(affectedProb),
      bothCarriers: getFraction(bothCarriers),
      oneCarrier: getFraction(oneCarrier),
      noCarriers: getFraction(noCarriers)
    });
  };

  const Step = ({ title, children }) => (
    <div className="bg-blue-100 p-4 rounded-lg mb-4">
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      {children}
    </div>
  );

  const ParentScenario = ({ scenario, probability }) => (
    <div>
      <p>{scenario}</p>
      <div className="flex">
        <StickFigure type={scenario.includes('ทั้งคู่') ? 'carrier' : 'normal'} />
        <StickFigure type={scenario.includes('ไม่') ? 'normal' : 'carrier'} />
      </div>
      <p>โอกาส: {probability}</p>
    </div>
  );

  const ChildScenario = ({ scenario, outcomes }) => (
    <div>
      <p>{scenario}</p>
      <div className="flex">
        {outcomes.map((type, index) => <StickFigure key={index} type={type} />)}
      </div>
      <p>{outcomes.filter(o => o === 'normal').length}/4 ปกติ, 
         {outcomes.filter(o => o === 'carrier').length}/4 พาหะ, 
         {outcomes.filter(o => o === 'affected').length}/4 เป็นโรค</p>
    </div>
  );

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">เครื่องมือสอนการคำนวณโอกาสการเกิดโรคและพาหะโรคยีนด้อยเมื่อพ่อและแม่เป็นพาหะ</h1>
      
      <Step title="ขั้นที่ 0: กำหนดโอกาสที่พ่อและแม่จะเป็นพาหะ">
        <p>กำหนดโอกาสที่พ่อและแม่แต่ละคนจะเป็นพาหะของยีนด้อย (ในรูปแบบเศษส่วน):</p>
        <div className="mb-4">
          <label className="block mb-2">โอกาสที่พ่อเป็นพาหะ:</label>
          <input 
            type="text" 
            value={parent1Fraction} 
            onChange={(e) => setParent1Fraction(e.target.value)}
            className="w-full p-2 rounded mb-2"
            placeholder="ใส่เศษส่วน (เช่น 1/4)"
          />
          <label className="block mb-2">โอกาสที่แม่เป็นพาหะ:</label>
          <input 
            type="text" 
            value={parent2Fraction} 
            onChange={(e) => setParent2Fraction(e.target.value)}
            className="w-full p-2 rounded"
            placeholder="ใส่เศษส่วน (เช่น 1/4)"
          />
        </div>
      </Step>

      {step >= 1 && (
        <Step title="ขั้นที่ 1: โอกาสของการเป็นพาหะของพ่อและแม่">
          <p>จากโอกาสที่คุณกำหนด นี่คือสถานการณ์ที่เป็นไปได้:</p>
          <div className="flex justify-around">
            <ParentScenario scenario="พ่อและแม่เป็นพาหะทั้งคู่" probability={outcomes.bothCarriers} />
            <ParentScenario scenario="พ่อหรือแม่เป็นพาหะ" probability={outcomes.oneCarrier} />
            <ParentScenario scenario="พ่อและแม่ไม่เป็นพาหะ" probability={outcomes.noCarriers} />
          </div>
          <p className="mt-2">คำอธิบายการคำนวณ:</p>
          <ul className="list-disc list-inside">
            <li>พ่อและแม่เป็นพาหะทั้งคู่: {parent1Fraction} × {parent2Fraction} = {outcomes.bothCarriers}</li>
            <li>พ่อหรือแม่เป็นพาหะ: ({parent1Fraction} × (1 - {parent2Fraction})) + ((1 - {parent1Fraction}) × {parent2Fraction}) = {outcomes.oneCarrier}</li>
            <li>พ่อและแม่ไม่เป็นพาหะ: (1 - {parent1Fraction}) × (1 - {parent2Fraction}) = {outcomes.noCarriers}</li>
          </ul>
        </Step>
      )}

      {step >= 2 && (
        <Step title="ขั้นที่ 2: โอกาสของลูกในแต่ละสถานการณ์">
          <div className="flex justify-around">
            <ChildScenario scenario="พ่อและแม่เป็นพาหะทั้งคู่" outcomes={['normal', 'carrier', 'carrier', 'affected']} />
            <ChildScenario scenario="พ่อหรือแม่เป็นพาหะ" outcomes={['normal', 'normal', 'carrier', 'carrier']} />
            <ChildScenario scenario="พ่อและแม่ไม่เป็นพาหะ" outcomes={['normal', 'normal', 'normal', 'normal']} />
          </div>
          <p className="mt-2">คำอธิบายโอกาส 1/2 และ 1/4:</p>
          <ul className="list-disc list-inside">
            <li>เมื่อพ่อและแม่เป็นพาหะทั้งคู่ ลูกแต่ละคนมีโอกาส 1/4 ที่จะเป็นโรค (aa), 1/2 ที่จะเป็นพาหะ (Aa), และ 1/4 ที่จะปกติ (AA)</li>
            <li>โอกาส 1/2 ที่จะเป็นพาหะมาจากสองกรณี: ได้ยีน A จากพ่อและ a จากแม่, หรือได้ยีน a จากพ่อและ A จากแม่</li>
            <li>เมื่อพ่อหรือแม่เป็นพาหะเพียงคนเดียว ลูกแต่ละคนมีโอกาส 1/2 ที่จะเป็นพาหะและ 1/2 ที่จะปกติ</li>
          </ul>
        </Step>
      )}

      {step >= 3 && (
        <Step title="ขั้นที่ 3: คำนวณโอกาสโดยรวม">
          <p>มาคำนวณโอกาสโดยรวมจากข้อมูลที่คุณใส่:</p>
          <div className="bg-yellow-200 p-2 rounded mb-2">
            <p>โอกาสเป็นโรค: (พ่อและแม่เป็นพาหะทั้งคู่) × 1/4 = {outcomes.bothCarriers} × 1/4 = {outcomes.affected}</p>
            <p>โอกาสเป็นพาหะ: (พ่อและแม่เป็นพาหะทั้งคู่ × 1/2) + (พ่อหรือแม่เป็นพาหะ × 1/2) = ({outcomes.bothCarriers} × 1/2) + ({outcomes.oneCarrier} × 1/2) = {outcomes.carrier}</p>
            <p>โอกาสปกติ: 1 - (โอกาสเป็นโรค + โอกาสเป็นพาหะ) = 1 - ({outcomes.affected} + {outcomes.carrier}) = {outcomes.normal}</p>
          </div>
          <p className="mt-2">การคำนวณเหล่านี้รวมโอกาสจากขั้นที่ 1 และ 2 เพื่อให้ได้โอกาสโดยรวมของผลลัพธ์ทางพันธุกรรมของลูก</p>
        </Step>
      )}

      {step >= 4 && (
        <Step title="ขั้นที่ 4: การแสดงผลด้วยภาพ">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={Object.entries(outcomes).slice(0, 3).map(([name, value]) => ({ name, value: parseFraction(value) }))}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => ${name === 'normal' ? 'ปกติ' : name === 'carrier' ? 'พาหะ' : 'เป็นโรค'}: ${getFraction(value)}}
              >
                {Object.entries(outcomes).slice(0, 3).map((entry, index) => (
                  <Cell key={cell-${index}} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend formatter={(value) => value === 'normal' ? 'ปกติ' : value === 'carrier' ? 'พาหะ' : 'เป็นโรค'} />
            </PieChart>
          </ResponsiveContainer>
          <p className="mt-2">แผนภูมิวงกลมนี้แสดงเศษส่วนที่เราคำนวณได้สำหรับแต่ละผลลัพธ์: ปกติ ({outcomes.normal}), พาหะ ({outcomes.carrier}), และเป็นโรค ({outcomes.affected})</p>
        </Step>
      )}

<div className="mt-4">
        {step < 4 ? (
          <button 
            className="bg-blue-500 text-white p-2 rounded"
            onClick={() => setStep(step + 1)}
          >
            ขั้นตอนถัดไป
          </button>
        ) : (
          <button 
            className="bg-green-500 text-white p-2 rounded"
            onClick={() => setStep(0)}
          >
            เริ่มใหม่
          </button>
        )}
      </div>
    </div>
  );
};

export default ThaiGeneticProbabilityCalculator;
