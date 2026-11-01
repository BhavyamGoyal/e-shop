# Tinglet Jeep Kit Card

A modern, boxy Wrangler-style jeep as a snap-off sprue card. It replaces the WWII Willys look of the AGEPBIZ original and carries the Tinglet name on the plate.

Files in this folder:
- `build_kit_card.py` generates the model. Run `python build_kit_card.py out.3mf preview.png`.
- `../tinglet-jeep-kit-card.3mf` is the printable card.
- `preview.png` is a render of the card.

## Card
- **Size:** 112 × 72 mm, tallest part 9 mm.
- **Frame:** 2 mm border plus one cross rail at y 41 mm, all 1.6 mm thick.
- **Runners:** 0.8 × 0.8 mm bars, 25 of them, linking each part to a neighbour or the frame. Cut them with flush cutters.
- **Print settings:** 0.16 mm layers, 2 walls, 15% infill, 0.4 mm nozzle, no supports, no raft. One colour is fine. Pause for a colour change at the top layers if you want a tan interior.
- **Fit clearance:** 0.2 mm on every peg, slot and axle.

## What changed from the original
| Original | Tinglet version |
|---|---|
| Willys, round fenders, flat bonnet | Wrangler-style: flat hood, seven-slot grille, round headlights |
| Chassis glued under the body | Chassis pegs into four square holes in the tub floor |
| Axles part of the chassis | Two separate 2.6 mm axles that slide into cradles under the chassis |
| Windshield loose | Windshield drops into a slot between the hood and the cowl lip |
| Star on the bonnet only | Star in a ring, kept, but now a free part for the hood or the spare |
| Single wheel piece | Tyre plus hub with 6 lug dimples, joined by two breakaway bridges |
| AGEPBIZ plate | TINGLET plate with raised letters |
| none | New roll bar, tow-hook bumper |

## Parts list
| # | Part | Qty | Footprint (mm) | Notes |
|---|---|---|---|---|
| 1 | Body tub with hood | 1 | 50.8 × 24 | Solid 7 mm hood, 8.5 mm tub walls, 1.6 mm floor, seven grille bars, two headlights, windshield slot, 4 peg holes. |
| 2 | Windshield frame | 1 | 20.4 × 12 × 1.2 | Open frame with a centre post. Lower 2.4 mm sits in the slot. |
| 3 | Roll bar | 1 | 20 × 9 × 1.6 | Flat U-shape with a cross bar. Stands on its legs behind the seats. |
| 4 | Bumper | 1 | 24 × 3.4 × 4.2 | Bar with two tow-hook rings. Glue to the front face. |
| 5 | Chassis | 1 | 46 × 14 × 4.6 | Two rails, two axle cradles, four 2.4 mm pegs on top. |
| 6 | Axles | 2 | 34 × 2.6 | Slide in from the side through the cradles. |
| 7 | Wheel sets | 5 | 12 × 12 × 4.8 | Tyre with 22 tread lugs, hub inside it. Four on the axles, one spare on the rear. |
| 8 | Front seats | 2 | 9 × 7.2 × 9 | Base, 9 mm back and side bolsters. |
| 9 | Rear bench | 1 | 7 × 17.6 × 7 | Spans the tub width. |
| 10 | Steering wheel | 1 | 11.4 × 6.6 × 1.4 | Ring, two spokes and a column. |
| 11 | Jerry can | 1 | 7.4 × 6.4 × 2.8 | Spout, handle and cap. |
| 12 | Star emblem | 1 | 8.4 × 8.4 × 0.8 | Five-point star fused to a ring. |
| 13 | Tinglet plate | 1 | 38 × 8 × 1.4 | Raised 5×7 block letters, 0.4 mm proud. |

## Card layout (top view, 112 × 72, origin bottom-left)
```
+------------------------------------------------------------+
| BODY TUB + HOOD        | WINDSHIELD     |  ROLL BAR        |
| (4,44)                 | JERRY  WHEEL   |  BUMPER          |
|========================= cross rail =======================|
| CHASSIS         | SEAT SEAT | BENCH   |        STAR        |
| AXLE A     AXLE B                                          |
| WHEEL x5                      | TINGLET PLATE              |
+------------------------------------------------------------+
```

## Assembly
1. Cut every part off its runners and trim the stubs flush.
2. Slide both axles into the chassis cradles.
3. Press a tyre set on each axle end. The hub flange faces outward. Keep the fifth for the spare.
4. Press the four chassis pegs up into the holes in the tub floor.
5. Set the front seats and the rear bench in the tub.
6. Drop the windshield into the slot behind the hood.
7. Stand the roll bar behind the seats and glue the bumper, jerry can and star.

## Notes
- The spare, bumper, jerry can, roll bar and seats are loose fits and want a drop of glue.
- Test-print one wheel set first. The 0.2 mm gap between hub and tyre is the tightest fit on the card.
- The preview is a plain shaded render, not a slicer view. Open the 3MF in Bambu Studio to check orientation and layers before printing.
