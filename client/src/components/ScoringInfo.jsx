import React from 'react';

const ScoringInfo = () => {
  return (
    <div className="scoring-info">
      <h4>📊 מערכת הניקוד</h4>
      <div className="scoring-rules">
        <div className="scoring-rule">
          <div className="points">10 נקודות</div>
          <div className="description">תוצאה מדויקת</div>
        </div>
        <div className="scoring-rule">
          <div className="points">3 נקודות</div>
          <div className="description">תוצאה נכונה (ניצחון/תיקו/הפסד)</div>
        </div>
        <div className="scoring-rule">
          <div className="points">0 נקודות</div>
          <div className="description">תוצאה שגויה</div>
        </div>
      </div>
    </div>
  );
};

export default ScoringInfo;
