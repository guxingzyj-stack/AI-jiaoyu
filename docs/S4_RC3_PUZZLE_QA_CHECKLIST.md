# S4 RC3 Puzzle QA Checklist

Purpose: verify every S4 RC3 puzzle has matching scene conditions, visual state, answer logic, wrong feedback, and success summary.

## Geometry Mountain

Chapter: Geometry Mountain  
Mechanic: Shape slot  
Visual condition: A mountain gate slot shows a triangular outline without text giving away the rule.  
Correct answer: 三角形  
Wrong options: 圆形, 正方形  
Why a child can judge: the visible slot has pointed corners and does not match a round or square stone.  
Wrong feedback: the stone outline does not match the slot; after repeated misses, look at the pointed corners.  
Success feedback: the triangle fits into the gate.  
Pass: yes.

Chapter: Geometry Mountain  
Mechanic: Stone step slot  
Visual condition: Three broken path gaps show pointed stone-step silhouettes.  
Correct answer: 三角石, 三角石, 三角石  
Wrong options: 圆石, 方石  
Why a child can judge: the gap shape has pointed edges; round and square stones visibly do not fit.  
Wrong feedback: the stone would wobble and does not match the gap.  
Success feedback: the triangular steps connect and the path lights up.  
Pass: yes.

Chapter: Geometry Mountain  
Mechanic: Mirror slot  
Visual condition: A clear mirror line separates the left pattern and candidate right-side light pieces.  
Correct answer: 三角形  
Wrong options: 圆形, 长方形  
Why a child can judge: only the triangle candidate can mirror the left shape and connect at the mirror line.  
Wrong feedback: the two sides still do not match, or the edge does not connect.  
Success feedback: the mirror pattern joins and the cave lights up.  
Pass: yes.

## Time City

Chapter: Time City  
Mechanic: Start clock  
Visual condition: The clock face and text both start at 1:00. The target is shown as 3:00.  
Correct answer: current clock state is 3:00.  
Wrong options: any state with hour not 3 or minute not 00.  
Why a child can judge: the hour hand, minute hand, current text, and target text stay synchronized.  
Wrong feedback: if hour is early, keep moving the hour hand; if minute is not 00, return the minute hand to 00.  
Success feedback: the clock reaches 3:00 and the train can depart.  
Pass: yes. Internal check: `isClockSolved(time) === hour === 3 && minute === 0`.

Chapter: Time City  
Mechanic: Train order  
Visual condition: Three platform slots are labeled early, middle, late. Train tickets show 2:00, 3:00, 4:00.  
Correct answer: 2:00 -> 3:00 -> 4:00  
Wrong options: any later train placed before an earlier train.  
Why a child can judge: the platform order is visibly early-to-late, and the smaller hour arrives earlier.  
Wrong feedback: this train arrives a little later and should probably go behind.  
Success feedback: the trains are arranged and the track lights up.  
Pass: yes.

Chapter: Time City  
Mechanic: Arrival bridge  
Visual condition: The train leaves at 3:00 and travels 30 minutes toward visible candidate stations.  
Correct answer: 3:30  
Wrong options: 3:15, 4:00  
Why a child can judge: half an hour after 3:00 puts the minute hand at 30.  
Wrong feedback: 3:15 is too early; 4:00 is too late.  
Success feedback: the train reaches the 3:30 station and the bridge lights up.  
Pass: yes.

## Fraction Valley

Chapter: Fraction Valley  
Mechanic: Pie sharing  
Visual condition: The pie starts whole. After "切开圆饼", it visibly becomes two equal halves.  
Correct answer: 切开圆饼 -> 拿一半  
Wrong options: choosing a side before cutting, or choosing unequal parts.  
Why a child can judge: the pie only becomes selectable as a fair half after it is cut into two equal parts.  
Wrong feedback: the pie has not been fairly split yet, or the parts are not the same size.  
Success feedback: one of two equal parts is taken; that is one half.  
Pass: yes.

Chapter: Fraction Valley  
Mechanic: Quarter garden  
Visual condition: Four equal garden blocks are shown; selected blocks light up.  
Correct answer: 第1块 -> 第2块  
Wrong options: selecting blocks in a way that does not produce the target two lit blocks.  
Why a child can judge: every block is the same size and the lit count is visible.  
Wrong feedback: count how many blocks are lit.  
Success feedback: the four-equal-part garden lights up.  
Pass: yes.

Chapter: Fraction Valley  
Mechanic: Equal river  
Visual condition: Left bank shows one of two parts lit; right bank candidates show one, two, or three of four parts lit.  
Correct answer: 2/4  
Wrong options: 1/4, 3/4  
Why a child can judge: two of four right-bank parts visually match one of two left-bank parts.  
Wrong feedback: the selected side is a little less or a little more.  
Success feedback: 2/4 and 1/2 are the same amount, and the bridge lights up.  
Pass: yes.

## Star Core

Chapter: Star Core  
Mechanic: Forest star ring  
Visual condition: The forest ring asks for the power used when energy was exactly enough.  
Correct answer: 凑十  
Wrong options: 乱点, 跳过  
Why a child can judge: the memory refers to the forest make-ten rescue.  
Wrong feedback: that power was used somewhere else or was not a helpful action.  
Success feedback: the forest ring returns to the core.  
Pass: yes.

Chapter: Star Core  
Mechanic: Sea star ring  
Visual condition: Islands 1 to 9 are visible and the boat jumps every 3 spaces.  
Correct answer: 3 -> 6 -> 9  
Wrong options: 4 or any island not on the 3-step rhythm.  
Why a child can judge: every jump adds 3.  
Wrong feedback: the boat does not land on that island this time.  
Success feedback: 3, 6, and 9 light up.  
Pass: yes.

Chapter: Star Core  
Mechanic: Geometry star ring  
Visual condition: A simplified shape slot shows the same triangle-slot logic as Geometry Mountain.  
Correct answer: 三角形  
Wrong options: 圆形, 正方形  
Why a child can judge: the slot outline matches a triangle.  
Wrong feedback: the shape does not match the slot.  
Success feedback: the geometry memory returns.  
Pass: yes.

Chapter: Star Core  
Mechanic: Time star ring  
Visual condition: The memory starts from 3:00 and asks for half an hour later.  
Correct answer: 3:30  
Wrong options: 3:00, 4:00  
Why a child can judge: 30 minutes moves the minute hand to 30.  
Wrong feedback: the station is too early or too late.  
Success feedback: the Time City memory returns.  
Pass: yes.

Chapter: Star Core  
Mechanic: Fraction star ring  
Visual condition: Left side shows 1/2; right side candidates show 1/4, 2/4, and 3/4 as bars.  
Correct answer: 2/4  
Wrong options: 1/4, 3/4  
Why a child can judge: the right-side two-of-four bar matches the left-side one-of-two bar.  
Wrong feedback: the selected part is not the same amount as the left side.  
Success feedback: the half-equivalent memory returns.  
Pass: yes.
