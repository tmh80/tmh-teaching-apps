/* Fish body outlines for code-drawn creatures (used by Adapt Lab's drawCreature).
   Measured from the PhyloPic silhouettes in ../animals/ with find-graphics/scripts/profile.py, then smoothed by hand.
   Profiles run tail root (0) -> snout (1); values are fractions of half the body depth. */
const FISH_LOOK={
 fish:{depth:.34,top:[[0,-.26],[.12,-.46],[.31,-.78],[.5,-1],[.69,-.98],[.81,-.86],[.93,-.52],[1,.12]],bot:[[0,.26],[.12,.46],[.31,.78],[.5,.96],[.69,.9],[.81,.72],[.93,.42]],
   eye:[.87,-.2],gill:.78,tail:'fork',tailK:1,dorsal:[[.47,.67,.95,.3]],anal:[[.25,.35,.45]],pec:[.73,.55,.5]},
 mackerel:{depth:.31,top:[[0,-.26],[.12,-.46],[.31,-.78],[.5,-1],[.69,-.98],[.81,-.86],[.93,-.52],[1,.12]],bot:[[0,.26],[.12,.46],[.31,.78],[.5,.96],[.69,.9],[.81,.72],[.93,.42]],
   eye:[.87,-.2],gill:.78,tail:'fork',tailK:1.15,dorsal:[[.53,.68,.8,.35],[.31,.38,.45,.4]],anal:[[.28,.36,.4]],pec:[.74,.5,.45],finlets:true,bands:true},
 shark:{depth:.37,top:[[0,-.2],[.22,-.56],[.4,-.85],[.64,-1],[.82,-.86],[.94,-.54],[1,-.08]],bot:[[0,.36],[.22,.61],[.4,.98],[.64,.95],[.82,.8],[.94,.42]],
   eye:[.9,-.3],gill:.8,gills:'slits',tail:'shark',tailK:1.2,dorsal:[[.47,.63,1.25,.22],[.12,.17,.38,.3]],anal:[[.13,.18,.3]],pec:'shark',denticles:true}};
