/* Adapt Lab model · vocabulary, colours, biomes, traits and real organisms
   Ported from the old Adapt-Lab.html with the maths unchanged (see docs/Adapt_Lab_Brief.md).
   No DOM access. Works in the browser (window.AdaptModel) and in Node (module.exports). */
(function(){
"use strict";
const M=globalThis.AdaptModel=globalThis.AdaptModel||{};
const {clamp,n01}=M;
const VOCAB={
 physical:["Physical adaptation","A body feature, such as thick fur, gills, big ears, spines or waxy leaves."],
 behavioural:["Behavioural adaptation","Something an animal does, such as being active at night or hibernating."],
 responses:["Plant responses","Plants do not behave like animals, but they respond to their environment: dropping leaves, dying back or opening their pores at night."],
 camouflage:["Camouflage","Colouring that helps an organism blend in with its surroundings so predators struggle to see it."],
 counter:["Countershading","Dark on top and pale underneath. From above it matches the dark water; from below it matches the bright surface. Common in fish, sharks and penguins."],
 warning:["Warning colours","Bright colours, like orange with black, that tell predators an animal is poisonous. Predators learn to avoid them."],
 insulation:["Insulation","A layer, such as fur, feathers or fat, that slows down heat loss from the body."],
 sav:["Surface area to volume","Small bodies have a lot of skin for their size, so they lose heat quickly. Big bodies have less skin for their size, so they keep heat in."],
 nocturnal:["Nocturnal","Active at night and resting during the day."],
 crepuscular:["Crepuscular","Active at dawn and dusk, when it is not too hot and light is low."],
 hibernate:["Hibernate","To spend the harsh season in a deep, sleep-like state, living on stored fat. In hot places this is called aestivation."],
 migrate:["Migrate","To travel to a different place for part of the year, then return."],
 predator:["Predator","An animal that hunts and eats other animals (its prey)."],
 warm:["Warm-blooded (endotherm)","An animal that makes its own body heat, such as a mammal or bird. It needs lots of food to stay warm."],
 cold:["Cold-blooded (ectotherm)","An animal whose body is as warm as its surroundings, such as a reptile, amphibian, fish or insect. It needs much less food."],
 lungs:["Lungs","Air sacs inside the body that take oxygen from air. Lungs do not work underwater."],
 gills:["Gills","Feathery organs that take oxygen from water. Out of water they collapse and dry out."],
 tubes:["Air tubes (tracheae)","Tiny tubes that carry air straight into the body, like an insect's. They only work for small animals."],
 salt:["Salt balance","Sea water is salty. Sea animals need ways to get rid of extra salt, such as special glands or kidneys. Freshwater animals need to keep salt in."],
 streamlined:["Streamlined","A smooth, torpedo shape that slips easily through water or air."],
 herbivore:["Herbivore","An animal that eats plants."],
 carnivore:["Carnivore","An animal that eats other animals."],
 stomata:["Stomata","Tiny pores in a leaf. They let carbon dioxide in, but water vapour escapes through them too."],
 deciduous:["Deciduous","A plant that drops its leaves in the harsh season, then grows new ones."],
 evergreen:["Evergreen","A plant that keeps its leaves all year."],
 dormant:["Dormant","Alive but inactive, waiting for better conditions, for example as a seed, bulb or roots underground."],
 grazer:["Grazer","An animal that eats plants, such as a deer, zebra or sea urchin."],
 producer:["Producer","A living thing that makes its own food by photosynthesis. Plants are producers."],
 aquatic:["Aquatic","Living in water."],
 selection:["Natural selection","Individuals whose traits suit the environment survive and reproduce more, so those traits become more common over generations."],
 variation:["Variation","Differences between individuals of the same species."]
};
/* v(term, text) marks a glossary word inside a label. The model returns plain text; the shell can set AdaptModel.vocabLink to make it a tappable word. */
function v(term,text){return M.vocabLink?M.vocabLink(term,text||VOCAB[term][0].toLowerCase()):(text||VOCAB[term][0].toLowerCase())}
/* ================= data ================= */
const PAL={white:{b:'#eceeec',d:'#aeb7bc',l:'#ffffff'},sandy:{b:'#d3a96c',d:'#97703f',l:'#ecd4a8'},brown:{b:'#835737',d:'#4f2f1c',l:'#ae8461'},
  grey:{b:'#8c8f8d',d:'#5a5d5c',l:'#bcbfbd'},green:{b:'#6e8b47',d:'#41592a',l:'#a3b977'},black:{b:'#37373d',d:'#1b1b1f',l:'#62626b'},
  blue:{b:'#4f7fae',d:'#2c5379',l:'#86acd3'},silver:{b:'#b9c3cc',d:'#7d8a96',l:'#e8eef3'},orange:{b:'#e07b24',d:'#a44e12',l:'#f4a85e'}};
const BIOMES={
 tundra:{name:'Arctic tundra',temps:[[-5,-15],[10,2],[-8,-16],[-26,-36]],hs:3,seasons:['Spring thaw','Short summer','Autumn','Long winter'],dot:'#7fb2d6',
   match:{white:1,grey:.55,silver:.6,sandy:.3,brown:.25,green:.15,black:.15,blue:.3,orange:.05},gname:'snow',
   pd:.45,pn:.5,preds:'Arctic foxes, snowy owls and wolves',plantF:.7,preyF:.85,harsh:.9,dry:.12,burrow:.55,open:true,herd:.25,cover:.2,
   frost:1,heatP:0,graze:.3,comp:.15,wind:.8,perma:true,grazers:'Caribou, hares and lemmings',pdry:.25,cold:true},
 desert:{name:'Hot desert',temps:[[30,14],[44,26],[32,16],[20,5]],hs:1,seasons:['Spring','Scorching summer','Autumn','Mild winter'],dot:'#d9a85f',
   match:{sandy:1,grey:.55,brown:.55,white:.3,silver:.35,green:.25,black:.15,blue:.1,orange:.35},gname:'sand',
   pd:.55,pn:.35,preds:'Hawks by day, coyotes and snakes at night',plantF:.55,preyF:.5,harsh:.55,dry:.65,burrow:1,open:true,herd:.1,cover:.3,
   frost:.2,heatP:1,graze:.4,comp:.1,wind:.3,perma:false,grazers:'Jackrabbits, locusts and camels',pdry:1},
 forest:{name:'Temperate forest',temps:[[14,4],[23,13],[13,4],[1,-7]],hs:3,seasons:['Spring','Summer','Autumn','Cold winter'],dot:'#5f8f4e',
   match:{brown:1,green:.85,grey:.65,black:.5,sandy:.45,white:.15,silver:.3,blue:.1,orange:.2},gname:'leaf litter',
   pd:.45,pn:.55,preds:'Hawks by day, foxes and owls at night',plantF:1.1,preyF:.8,harsh:.75,dry:.1,burrow:.9,open:false,herd:.1,cover:.8,
   frost:.6,heatP:.05,graze:.4,comp:1,wind:.1,perma:false,grazers:'Deer, rabbits and caterpillars',pdry:.12,cold:true},
 grassland:{name:'Savanna grassland',temps:[[32,20],[29,19],[30,17],[33,13]],hs:3,seasons:['Rains begin','Wet season','Rains end','Long dry season'],dot:'#c7a64e',
   match:{sandy:.95,brown:.6,orange:.55,grey:.45,green:.5,black:.3,white:.2,silver:.3,blue:.1},gname:'dry grass',
   pd:.65,pn:.45,preds:'Eagles and cheetahs by day, lions and hyenas at night',plantF:1.1,preyF:1,harsh:.6,dry:.3,burrow:.8,open:true,herd:.3,cover:.3,
   frost:0,heatP:.55,graze:1,comp:.35,wind:.35,perma:false,grazers:'Zebras, wildebeest, antelope and giraffes',pdry:.5},
 ocean:{name:'Coastal ocean',aquatic:true,salt:true,temps:[[10,10],[16,16],[13,13],[7,7]],hs:3,seasons:['Spring','Summer','Autumn','Stormy winter'],dot:'#3f7fb3',
   match:{blue:1,silver:.95,grey:.7,green:.5,black:.45,white:.35,sandy:.4,brown:.3,orange:.15},gname:'open water',
   pd:.6,pn:.45,preds:'Sharks, seals and diving seabirds',plantF:.6,preyF:1.1,harsh:.35,dry:0,burrow:.3,open:true,herd:.35,cover:.35,
   frost:0,heatP:0,graze:.45,comp:.2,wind:.55,perma:false,grazers:'Sea urchins, snails, turtles and fish',pdry:0},
 freshwater:{name:'Lake & river',aquatic:true,salt:false,temps:[[10,8],[20,17],[12,10],[3,3]],hs:3,seasons:['Spring','Summer','Autumn','Icy winter'],dot:'#4f9a8a',
   match:{green:.9,brown:.85,grey:.7,silver:.75,blue:.6,black:.6,sandy:.5,white:.2,orange:.15},gname:'weedy water',
   pd:.5,pn:.45,preds:'Pike, herons and otters',plantF:.9,preyF:.8,harsh:.55,dry:0,burrow:.6,open:false,herd:.2,cover:.75,
   frost:.3,heatP:0,graze:.35,comp:.4,wind:.15,perma:false,grazers:'Snails, ducks, insect larvae and fish',pdry:0,cold:true}
};

Object.keys(BIOMES).forEach(k=>BIOMES[k].id=k);
const getB=b=>typeof b==='string'?BIOMES[b]:b;
/* ----- animal traits: simple choices; numeric rows share a value with an Advanced slider ----- */
const A_SECTIONS=[
 {title:'Body',rows:[
  {k:'cov',g:'P',label:'Body covering',opts:[['fur','Fur'],['feathers','Feathers'],['scales','Scales'],['skin','Moist skin'],['exo','Hard exoskeleton']]},
  {k:'blood',g:'P',label:()=>`Body heat · ${v('warm','warm')} ${v('cold','cold')}`,opts:[['warm','Warm-blooded'],['cold','Cold-blooded']]},
  {k:'breathe',g:'P',label:()=>`Breathes with · ${v('lungs')} ${v('gills')} ${v('tubes','air tubes')}`,opts:[['lungs','Lungs'],['gills','Gills'],['skinlungs','Skin & lungs'],['tubes','Air tubes']]},
  {k:'shape',g:'P',label:()=>`Body shape · ${v('streamlined')}`,opts:[['round','Round'],['long','Long & low'],['tall','Tall'],['stream','Streamlined']]},
  {k:'size',g:'P',num:true,label:()=>`Body size · ${v('sav','surface area')}`,opts:[[5,'Tiny'],[25,'Small'],[50,'Medium'],[75,'Large'],[95,'Huge']]}
 ]},
 {title:'Moving',rows:[
  {k:'legs',g:'P',label:'Legs',opts:[['0','None'],['2','Two'],['4','Four'],['6','Six or more']]},
  {k:'legLen',g:'P',num:true,label:'Leg length',opts:[[20,'Short'],[50,'Medium'],[85,'Long']],show:t=>t.legs!=='0'},
  {k:'posture',g:'P',label:'Leg posture',opts:[['upright','Under the body'],['sprawl','Out to the sides, low']],show:t=>t.legs==='4'},
  {k:'wings',g:'P',label:'Wings',opts:[['none','None'],['fly','Wings that fly'],['flightless','Small, cannot fly']]},
  {k:'fins',g:'P',label:'Fins or flippers',opts:[['none','None'],['fins','Yes']]}
 ]},
 {title:'Keeping warm, cool and wet',rows:[
  {k:'insul',g:'P',num:true,label:()=>`Fur or feather thickness · ${v('insulation')}`,opts:[[15,'Thin'],[50,'Medium'],[90,'Thick']],show:t=>t.cov==='fur'||t.cov==='feathers'},
  {k:'fatWhere',g:'P',label:'Fat store',opts:[['none','None'],['all','Layer all over'],['hump','In a hump']]},
  {k:'ears',g:'P',num:true,label:'Ear size',opts:[[15,'Small'],[50,'Medium'],[90,'Large']],show:t=>t.cov==='fur'},
  {k:'waterSave',g:'P',num:true,label:'Saving water',opts:[[25,'Needs to drink daily'],[85,'Barely needs to drink']],show:(t,b)=>!b.aquatic},
  {k:'salt',g:'P',num:true,label:()=>`Copes with · ${v('salt','salt water')}`,opts:[[5,'Fresh water only'],[55,'Both'],[95,'Salt water']]}
 ]},
 {title:'Looks & defence',rows:[
  {k:'color',g:'P',label:()=>`Colour · ${v('camouflage')}`,opts:Object.keys(PAL).map(c=>[c,c.charAt(0).toUpperCase()+c.slice(1)])},
  {k:'pattern',g:'P',label:()=>`Pattern · ${v('counter','countershading')}`,opts:[['plain','Plain'],['spots','Spots'],['stripes','Stripes'],['counter','Dark top, pale belly']]},
  {k:'defence',g:'P',label:()=>`Defence · ${v('warning','warning colours')}`,opts:[['none','None'],['spines','Spines'],['poison','Poison'],['shell','Hard shell']]}
 ]},
 {title:'Behaviour',beh:true,rows:[
  {k:'diet',g:'B',label:()=>`Eats · ${v('herbivore','plants')} ${v('carnivore','animals')}`,opts:[['plants','Plants'],['meat','Animals'],['both','Both']]},
  {k:'activity',g:'B',label:()=>`Active at · ${v('nocturnal')} ${v('crepuscular')}`,opts:[['day','Day'],['crep','Dawn & dusk'],['night','Night']]},
  {k:'season',g:'B',label:()=>`In the harsh season · ${v('hibernate')} ${v('migrate')}`,opts:[['active','Stays active'],['hibernate','Hibernates'],['migrate','Migrates']]},
  {k:'social',g:'B',label:'Lives',opts:[['solo','Alone'],['herd','In a group']]},
  {k:'senses',g:'B',label:'Finds food by',opts:[['sight','Sight'],['smell','Smell'],['tongue','Tasting the air (tongue)']]},
  {k:'escape',g:'B',label:()=>`When a ${v('predator')} comes`,opts:[['freeze','Freezes'],['flee','Escapes fast'],['hide','Hides away']]},
  {k:'store',g:'B',label:'Food',opts:[['none','Eats as it goes'],['cache','Stores food']]},
  {k:'care',g:'B',label:'Parental care',opts:[['none','Many young, no care'],['some','Some care'],['lots','Few young, lots of care']]}
 ]}
];
const A_SLIDERS=[
 {k:'size',label:'Body size',ends:['Tiny (beetle)','Huge (elephant)']},
 {k:'legLen',label:'Leg length',ends:['Short','Long'],show:t=>t.legs!=='0'},
 {k:'insul',label:'Fur or feather thickness',ends:['Thin','Very thick'],show:t=>t.cov==='fur'||t.cov==='feathers'},
 {k:'fat',label:'Amount of fat',ends:['Lean','Very fat'],show:t=>t.fatWhere!=='none'},
 {k:'ears',label:'Ear size',ends:['Tiny','Enormous'],show:t=>t.cov==='fur'},
 {k:'tail',label:'Tail length',ends:['No tail','Very long']},
 {k:'wingSize',label:'Wing size',ends:['Small','Huge'],show:t=>t.wings!=='none'},
 {k:'finSize',label:'Fin size',ends:['Small','Large'],show:t=>t.fins!=='none'},
 {k:'eyes',label:'Eye size',ends:['Small','Huge (sees in the dark)']},
 {k:'waterSave',label:'Saving water',ends:['Needs to drink daily','Barely needs to drink']},
 {k:'salt',label:'Copes with salt',ends:['Fresh water only','Salt water']}
];
const DEF_A={cov:'fur',blood:'warm',breathe:'lungs',shape:'round',legs:'4',wings:'none',fins:'none',color:'brown',pattern:'plain',diet:'plants',defence:'none',fatWhere:'none',
  activity:'day',season:'active',social:'solo',escape:'flee',store:'none',care:'some',posture:'upright',senses:'sight',size:35,insul:40,fat:30,ears:45,legLen:45,tail:30,wingSize:55,finSize:50,eyes:40,waterSave:25,salt:5};

/* ----- plant traits ----- */
const P_SECTIONS=[
 {title:'Where and how it grows',rows:[
  {k:'water',g:'P',label:()=>`Grows · ${v('aquatic','in water')}`,opts:[['land','On land'],['aquatic','In water']]},
  {k:'form',g:'P',label:'Growth form',opts:[['herb','Grass or herb'],['shrub','Shrub'],['tree','Tree'],['succulent','Fleshy stem']]},
  {k:'height',g:'P',num:true,label:'Height',opts:[[15,'Low'],[50,'Medium'],[90,'Tall']]}
 ]},
 {title:'Leaves, stem and roots',rows:[
  {k:'leaf',g:'P',label:'Leaves',opts:[['spines','Spines only'],['needles','Needles'],['broad','Flat leaves'],['ribbon','Long ribbons']]},
  {k:'leafSize',g:'P',num:true,label:'Leaf size',opts:[[20,'Small'],[50,'Medium'],[90,'Large']],show:t=>t.leaf==='broad'},
  {k:'wax',g:'P',num:true,label:'Leaf surface',opts:[[10,'Thin'],[85,'Thick & waxy']]},
  {k:'roots',g:'P',pair:true,label:'Roots',opts:[['short','Short'],['wide','Wide & shallow'],['deep','Deep']]},
  {k:'store',g:'P',label:'Storage',opts:[['none','None'],['water','Water in stem'],['bulb','Food in a bulb']]},
  {k:'defence',g:'P',label:()=>`Defence against ${v('grazer','grazers')}`,opts:[['none','None'],['thorns','Thorns'],['bitter','Bitter taste']]},
  {k:'salt',g:'P',num:true,label:()=>`Copes with · ${v('salt','salt')}`,opts:[[5,'No salt'],[90,'Salty water or soil']]}
 ]},
 {title:'Responses & life cycle',beh:true,rows:[
  {k:'season',g:'B',label:()=>`In the harsh season · ${v('evergreen')} ${v('deciduous')} ${v('dormant')}`,opts:[['evergreen','Keeps leaves'],['deciduous','Drops leaves'],['dormant','Dies back']]},
  {k:'pores',g:'B',label:()=>`Opens leaf pores (${v('stomata')})`,opts:[['day','By day'],['night','At night']]},
  {k:'seeds',g:'B',label:'Spreads seeds by',opts:[['wind','Wind'],['animals','Animals'],['water','Water']]},
  {k:'seedSize',g:'B',label:'Seeds',opts:[['small','Many tiny seeds'],['large','A few big, well-stocked seeds']]}
 ]}
];
const ROOTS={short:[20,20],wide:[25,90],deep:[90,30]};
const P_SLIDERS=[
 {k:'height',label:'Height',ends:['Ground-hugging','Very tall']},
 {k:'leafSize',label:'Leaf size',ends:['Tiny','Huge'],show:t=>t.leaf==='broad'},
 {k:'wax',label:'Wax on leaves',ends:['None','Very thick']},
 {k:'rootDepth',label:'Root depth',ends:['Shallow','Very deep']},
 {k:'rootSpread',label:'Root spread',ends:['Narrow','Very wide']},
 {k:'stemStore',label:'Water stored in stem',ends:['A little','Swollen with water'],show:t=>t.store==='water'},
 {k:'salt',label:'Copes with salt',ends:['None','Very salty']}
];
const DEF_P={water:'land',form:'shrub',leaf:'broad',store:'none',defence:'none',season:'evergreen',pores:'day',seeds:'wind',seedSize:'small',height:45,leafSize:50,wax:10,rootDepth:20,rootSpread:20,stemStore:70,salt:5};

/* ----- real organisms (for comparison) ----- */
const A=o=>({...DEF_A,...o}),Pp=o=>({...DEF_P,...o});
const PRESETS={
 'arctic-hare':{name:'Arctic hare',kind:'animal',home:'tundra',t:A({color:'white',insul:90,fat:20,fatWhere:'all',ears:15,size:55,legLen:80,tail:8,activity:'crep',social:'herd',escape:'flee',eyes:45}),
   text:'White in winter, with thick fur, short ears and a large body that hold heat. Stays active all winter, digs snow shelters and gathers in groups.'},
 'arctic-fox':{name:'Arctic fox',kind:'animal',home:'tundra',t:A({care:'lots',shape:'long',color:'white',insul:95,fatWhere:'all',fat:55,ears:15,size:35,legLen:35,tail:75,diet:'meat',activity:'crep',escape:'hide',store:'cache',eyes:75}),
   text:'Thick white fur, small ears and short legs lose little heat. Builds up fat in autumn, shelters in dens and buries spare food for winter.'},
 'snowy-owl':{name:'Snowy owl',kind:'animal',home:'tundra',t:A({care:'lots',cov:'feathers',legs:'2',legLen:20,wings:'fly',wingSize:85,color:'white',pattern:'spots',insul:92,fatWhere:'all',fat:25,size:42,tail:35,diet:'meat',eyes:90}),
   text:'Dense white feathers cover even its toes. Huge eyes and silent wings help it hunt lemmings in the long Arctic days and nights.'},
 'fennec':{name:'Fennec fox',kind:'animal',home:'desert',t:A({care:'lots',shape:'long',color:'sandy',insul:40,ears:98,size:18,legLen:35,tail:60,diet:'both',activity:'night',social:'herd',escape:'hide',eyes:75,waterSave:85}),
   text:'Huge ears give off heat and hear prey underground. Spends the hot day in burrows, comes out at night and gets most of its water from food.'},
 'camel':{name:'Dromedary camel',kind:'animal',home:'desert',t:A({care:'lots',shape:'tall',color:'sandy',insul:30,fatWhere:'hump',fat:70,ears:15,size:92,legLen:95,tail:25,social:'herd',waterSave:96}),
   text:'Fat is stored in the hump, not all over, so heat escapes from the rest of the body. Long legs keep it off the hot sand, and it can go many days without drinking.'},
 'thorny-devil':{name:'Thorny devil',kind:'animal',home:'desert',t:A({care:'none',cov:'scales',blood:'cold',shape:'long',color:'sandy',pattern:'spots',defence:'spines',size:7,legLen:30,posture:'sprawl',senses:'tongue',tail:40,diet:'meat',escape:'freeze',waterSave:92}),
   text:'An Australian lizard covered in spines. Grooves between its scales carry water to its mouth. Like all reptiles, it relies on the sun for warmth.'},
 'locust':{name:'Desert locust',kind:'animal',home:'desert',t:A({care:'none',cov:'exo',blood:'cold',breathe:'tubes',shape:'long',legs:'6',legLen:75,wings:'fly',wingSize:70,color:'sandy',pattern:'spots',size:4,tail:0,season:'migrate',social:'herd',waterSave:75,eyes:55}),
   text:'An insect with an exoskeleton and air tubes. Huge swarms fly long distances to find fresh plants after rain.'},
 'rabbit':{name:'European rabbit',kind:'animal',home:'forest',t:A({color:'brown',insul:55,size:25,ears:55,legLen:45,tail:8,activity:'crep',social:'herd',escape:'hide',eyes:60}),
   text:'Brown fur matches leaf litter. Feeds at dawn and dusk and lives in groups in underground burrows called warrens.'},
 'wood-frog':{name:'Wood frog',kind:'animal',home:'forest',t:A({care:'none',posture:'sprawl',cov:'skin',blood:'cold',breathe:'skinlungs',legLen:60,tail:0,size:7,diet:'meat',activity:'crep',season:'hibernate',escape:'freeze',eyes:60,waterSave:10}),
   text:'Hibernates under leaf litter all winter. Its body can partly freeze and thaw again in spring.'},
 'zebra':{name:'Plains zebra',kind:'animal',home:'grassland',t:A({care:'lots',shape:'tall',color:'white',pattern:'stripes',insul:15,size:85,legLen:85,tail:40,ears:50,season:'migrate',social:'herd',eyes:50,waterSave:40}),
   text:'Lives in large herds. Stripes may make it hard for a predator to pick out one zebra. Many travel long distances to follow the rains.'},
 'ostrich':{name:'Ostrich',kind:'animal',home:'grassland',t:A({cov:'feathers',shape:'tall',legs:'2',legLen:95,wings:'flightless',wingSize:45,color:'black',insul:35,size:85,tail:40,diet:'both',social:'herd',eyes:80,waterSave:60}),
   text:'Cannot fly, but its long legs let it run at about 70 km/h. Huge eyes spot danger across the open grassland.'},
 'seal':{name:'Harbour seal',kind:'animal',home:'ocean',t:A({care:'lots',shape:'stream',legs:'0',fins:'fins',finSize:70,color:'grey',pattern:'spots',insul:40,fatWhere:'all',fat:90,ears:5,size:70,tail:10,diet:'meat',social:'herd',eyes:85,salt:90}),
   text:'A mammal with lungs, so it holds its breath to dive. A thick layer of blubber keeps it warm in cold water, and flippers make it a fast swimmer.'},
 'mackerel':{name:'Atlantic mackerel',kind:'animal',home:'ocean',t:A({care:'none',cov:'scales',blood:'cold',breathe:'gills',shape:'stream',legs:'0',fins:'fins',finSize:60,color:'blue',pattern:'counter',size:15,tail:0,diet:'meat',social:'herd',eyes:50,salt:95}),
   text:'A fish that swims in huge schools. Dark blue on top and silver below (countershading) hides it from predators above and below.'},
 'crab':{name:'Shore crab',kind:'animal',home:'ocean',t:A({care:'none',cov:'exo',blood:'cold',breathe:'gills',shape:'round',legs:'6',legLen:40,color:'green',defence:'shell',size:12,tail:0,diet:'both',activity:'night',escape:'hide',eyes:30,salt:85}),
   text:'A crustacean with an exoskeleton and gills. Its hard shell protects it, and it hides under rocks and seaweed when danger comes.'},
 'trout':{name:'Brown trout',kind:'animal',home:'freshwater',t:A({care:'none',cov:'scales',blood:'cold',breathe:'gills',shape:'stream',legs:'0',fins:'fins',finSize:55,color:'brown',pattern:'spots',size:25,tail:0,diet:'meat',activity:'crep',eyes:55,salt:10}),
   text:'A freshwater fish. Spotted brown sides blend with the riverbed, and it feeds on insects at dawn and dusk.'},
 'common-frog':{name:'Common frog',kind:'animal',home:'freshwater',t:A({care:'none',posture:'sprawl',cov:'skin',blood:'cold',breathe:'skinlungs',color:'green',pattern:'spots',legLen:70,tail:0,size:8,diet:'meat',activity:'crep',season:'hibernate',escape:'flee',eyes:60,salt:5,waterSave:10}),
   text:'Lives in and around ponds. Breathes through its moist skin as well as its lungs, and hibernates in the mud at the bottom of ponds in winter.'},
 'arctic-willow':{name:'Arctic willow',kind:'plant',home:'tundra',t:Pp({form:'shrub',leaf:'broad',leafSize:15,height:8,rootDepth:20,rootSpread:90,defence:'bitter',season:'deciduous'}),
   text:'Grows low, out of the wind and under the snow. Its roots spread sideways because the ground below stays frozen all year.'},
 'saguaro':{name:'Saguaro cactus',kind:'plant',home:'desert',t:Pp({form:'succulent',leaf:'spines',wax:90,rootDepth:20,rootSpread:95,store:'water',stemStore:90,height:90,defence:'thorns',pores:'night',seeds:'animals'}),
   text:'Spines instead of leaves and a waxy skin. The pleated stem swells to store water, and wide, shallow roots soak up rain fast.'},
 'oak':{name:'English oak',kind:'plant',home:'forest',t:Pp({seedSize:'large',form:'tree',leaf:'broad',leafSize:60,height:92,rootDepth:90,rootSpread:40,defence:'bitter',season:'deciduous',seeds:'animals'}),
   text:'Grows tall to reach the light, with deep roots and bitter leaves. Drops its leaves before winter. Jays and squirrels spread the acorns.'},
 'bluebell':{name:'Bluebell',kind:'plant',home:'forest',t:Pp({form:'herb',leaf:'ribbon',height:12,rootDepth:20,rootSpread:20,store:'bulb',defence:'bitter',season:'dormant'}),
   text:'Grows and flowers in early spring, before the trees above block the light, then survives the rest of the year as a bulb.'},
 'acacia':{name:'Umbrella acacia',kind:'plant',home:'grassland',t:Pp({seedSize:'large',form:'tree',leaf:'broad',leafSize:12,wax:70,height:88,rootDepth:95,rootSpread:40,defence:'thorns',season:'deciduous',seeds:'animals'}),
   text:'Long thorns, tiny waxy leaves and very deep roots. The flat top is out of reach of most grazers, but not giraffes.'},
 'grass':{name:'Red oat grass',kind:'plant',home:'grassland',t:Pp({form:'herb',leaf:'ribbon',height:45,rootDepth:35,rootSpread:85,season:'dormant'}),
   text:'Grows from the base, so it keeps growing after being grazed. In the dry season it dies back and regrows when the rains return.'},
 'eelgrass':{name:'Eelgrass',kind:'plant',home:'ocean',t:Pp({water:'aquatic',form:'herb',leaf:'ribbon',height:55,rootDepth:25,rootSpread:85,salt:95,seeds:'water'}),
   text:'One of the few flowering plants that lives in the sea. Ribbon leaves bend with the waves, and spreading roots grip the sandy seabed.'},
 'water-lily':{name:'Water lily',kind:'plant',home:'freshwater',t:Pp({seedSize:'large',water:'aquatic',form:'herb',leaf:'broad',leafSize:85,height:70,rootDepth:40,rootSpread:50,store:'bulb',season:'dormant',seeds:'water',salt:5}),
   text:'Roots in the mud, with long stems that float big round leaves on the surface to catch the light. Survives winter as a thick underground stem.'}
};
const KIND_DEF={animal:DEF_A,plant:DEF_P};
function orgName(o){return (o.name||'').trim()||(o.kind==='animal'?'My animal':'My plant')}
function rootsKey(t){for(const k in ROOTS){const[a,b]=ROOTS[k];if(Math.abs(t.rootDepth-a)<=15&&Math.abs(t.rootSpread-b)<=15)return k}return null}
Object.assign(M,{VOCAB,v,PAL,BIOMES,getB,A_SECTIONS,A_SLIDERS,DEF_A,P_SECTIONS,ROOTS,P_SLIDERS,DEF_P,PRESETS,KIND_DEF,orgName,rootsKey});
})();
if(typeof module!=='undefined')module.exports=globalThis.AdaptModel;
