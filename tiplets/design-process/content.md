### Sensory Overload

One of the foundational challenges in any SSD is *sensory overload*. Just like we use the notion of *resolution* (and sometimes *frame rate*) to denote the information density of visual media, different senses have varying degrees of sensory resolutions. We cannot expect a system that naively transmits all information in maximum bandwidth to “just work” – which is why I started to work on RTVA, a research dashboard containing efficient implementations of modern computer vision algorithms.

In context of VTSS, the **density of mechanosensory receptors** in the skin determine such sensory resolution. Mechanoreceptors are most densely packed in areas such as tongue and fingertips, which makes sense, given that Braille, a relatively successfuly accessibility medium, uses tactile dots that are read via fingertips.

We decided to use the Braille system as a proxy (or a baseline) of our exploration, using fingertips as the primary interface as well as the six-dot configuration that Braille users are already familiar with.

### Intelligent Filtering

To deal with the problem of sensory overload, we decided to employ a number of heuristics to determine the degree of importance of different elements in the field of view. First, we would train an object detection model to recognize common household items, frequently used objects (such as pen, mouse, earbuds), dangerous objects (such as cars, knives, power tools), and people. Then, we would use a segmentation algorithm (think of it as “isolating” or cropping each object within an image) to clean up all the un-important parts. Finally, we would run it through an edge detection algorithm so that it can be conveniently translated into Braille-like tactile signals.

### Real-Time Visual Analysis

[HIDE] `Consider making a separate page for RTVA`

TODO: Put the RTVA video here!

![](https://yunhocho.com/rtsa3.png)

**Real-Time Visual Analyzer (RTVA)** is a Python program that contains inference-optimized implementations of relevant computer vision models including YOLOv5 (object detection), YOLACT-Edge (instance segmentation), PIDINet (holistic edge detection), and mediapipe (hand tracking, facial mesh).

It additionally connects to a remote server with a beefy GPU (e.g., a hijacked Colab instance) to perform speech recognition and visual grounding using X and OFA, respectively.

### Spatiotemporal Modulation

From a hardware perspective, a TipLet is simply a wireless, battery-powered board with six vibration motors — not a large canvas filled with vibration motors. To let users sense shapes from a “virtual screen”, we use the concept of spatiotemporal modulation, where the signals are altered in a way that simulates the presence of a large picture made of Braille as users move their hands.

### Localization

That meant we needed a way to quickly and consistently track the location of each TipLet. This was implemented by using a head-mounted camera that runs a marker tracking algorithm (recognizing the look of an assembled TipLet ) as well as a hand tracking algorithm (as a fallback, in cases when the fingertip is temporarily occluded i.e., when user grabs the hand into a fist).

### Miniaturization

Fingertips have some of the highest density of mechanoreceptors among various parts of the body. The reason is clear: we use them to interact with the world. Imagine writing with a pen or typing on a keyboard, without being able to sense the subtle chanages in the orientation of the pen or being able to sense when the key has been pressed.

It was necessary to make Tiplets as small, unobtrusive, and invisible, and comfortable to wear, so that the benefits of being able to read the shapes outweigh the costs of occupying such a valuable sensory real estate.

Each TipLets measures 3.0 cm * 2.0 cm - comparable to the size of a penny. This includes the haptic actuators, microprocessor, wireless module, and the battery (that would last a couple hours of continual operation).

### Vibrotactile Interfaces

A large challenge we encountered was the lack of commercial availability for miniature haptic actuators. Turns out, that the #1 factor behind the consumption of vibration motors are smartphones. And because each smartphone only employs one (or two) motors inside it, and the output power of the actuator is proportional to its size, there hgitas not been much effort in miniaturizing it. There was one manufacturer, Vybronics, which produced a unit that measures 5 mm in diameter, but we kept wondering if we could go even smaller — so that we reach the spatial resolution of fingers.

### MEMA

![](https://yunhocho.com/Coil%20Candidates.jpg)

![](https://yunhocho.com/LRA%20FEM%20Results.jpg)

I started to consider the possibility of designing and fabricating custom haptic actuators, and ended up spending a full month doing that.

In literature, I found a series of work referred to as PEMA, p(?) electromagnetic actuators, which achieves exactly this, by using polymer substrate cured with magnetic particles and using liquid metal trapped inside the polyer to as a conductive wire to construct the electromagnetic mechanism. However, as it was an experimental prototype, the structure was too complex for large-scale manufacturing.

Instead, I realized that is possible to achieve a similar mechanism using the manufacturing processes of flexible printed circuits (FPC), which have thinly deposited layer of copper that remains flexible and polyimide insulating layers, which is also flexible. However, it would be difficult to directly prototype using this process, as the manufacturing lead times are 1-2 weeks and we would need to adjust a bunch of different parameters to find the resonant frequencies.

Thereby, as a prototype, we considered the viability of creating a small

Our laboratory lacked a laser cutter, so I visited the ROBOTIS makerspace to get a sheet of polyimide film. The results were… fascinating. Turns out that polyimide sheets have a hard time staying still on the laser cutter bed, due to thermal warping.

Eventually, we called MEMA a non-goal and went with the fallback option of using Vybronics ???? motors.

[HIDE] `Consider making MEMA a separate page`

### Final Conceptualization & User Needs

[visual: a wireframe diagram of a user sliding hand across space, with a geometrical shape (or object outline) in empty space, with annotations showing camera, connection to PC via Wi-Fi, computer vision, transmission via BLE, and perhaps refresh rate of system.] ← I think this might actually be somewhere already? There’s no away I didn’t sketch anything.

### Wireless Operation

### Component Selection

**Vybronics XXXXXX**: The most important component decision was the haptic actuator. There are two main categories of haptic actuators: eccentric rotating mass (ERM) and linear resonant actuator (LRA). [TODO: show an image]. LRAs are more power efficient, generally more pleasant, and can express more varied “textures”—but require a dedicated driver, since its input is AC signal that is sufficiently close to the its resonant frequency (which, due to manufacturing imperfections, is not precisely controlled; dedicated LRA drivers like DRV2605 perform in-flight resonant frequency calibration).

**LR XXXX**: Choosing the right battery was a bit of a challenge too—we wanted a battery that was small to fit into the board but powerful enough to drive the motors. I learned that batteries can’t discharge instantly; since it involves a heat-generating chemical reaction, they have a discharge factor (“C”) that is defined as a ratio to its maximum capacity. LR XXXX was the one that was actually available for purchase and offered the best trade-off.

### Motor Driver

DRV2605 was chosen because… I forgot. I think there was a reason. I liked that it came with a library of pre-built haptic effects—which could be used as an additional sensory dimension (i.e., like how sound consists of pitch and timbre).

### Electrical Schematic

The schematic is super simple: battery charging/protection circuitry is taken care of by DFR0868, so we only worry about the I2C communication with the DRV2605 boards. Because DRV2605 has a hardcoded I2C address, we use the EN pin to address specific motors in a linear scanning fashion.

### Printed Circuit Board (PCB)

Designing the PCB was interesting due to the tight space constraints. The board outline was first modeled in mechanical CAD then imported into KiCAD, to make sure we don’t run into the unfortunate situation of LRAs running into each other.

### Fabrication/Assembly

Since the project was funded under the Korean national science foundation, we could only use “domestic” vendors i.e., no JLCPCB (😭). And because our PCB manufacturer quoted some obscene price for BGA assembly, we decided to take it to our own hands. Thankfully, we could get a MHP-30 with our funding, and TipLets is small enough to fit inside its hot plate. Easy.

…or so I thought. After continually failing to solder the DRV2605 in {TODO} package properly, we got stuck.

### Cost

Each unit of {} cost around $5, meaning the entire set of TipLets (for all five fingers) would cost $150 alone for actuators. A little too expensive to my liking, but it’s not my money, 🤷‍♂️ I guess.

### Design for Manufacturing

I honestly had no idea how haptic motors were attached to PCBs—and stared at photos of half-disassembled smartphone PCB for hours. The problem is, LRAs are not supposed to go into reflow (my guess is its flappy part is made out of polyimide), yet they only come in these surface-mount looking packages. So I just left exposed pads of the right size, hoping we could figure something out with hacky soldering work.

### Firmware

The firmware is a simple Arduino program that initializes BLE as a subscriber to host device (PC) and routes signals to DRV2605. This experience made me appreciate all the thought that has gone into Bluetooth! And to not be mad for taking >30 seconds to pair sometimes.

### Testing

❌
