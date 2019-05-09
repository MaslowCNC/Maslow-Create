# A web based CAD program for cooperative design.

[![Build Status](https://travis-ci.org/MaslowCNC/Maslow-Create.svg?branch=master)](https://travis-ci.org/MaslowCNC/Maslow-Create)
[![Build Status](https://maslowcreate.org/documentation/badge.svg)](https://maslowcreate.org/documentation/)


![overview](https://raw.githubusercontent.com/BarbourSmith/Maslow-Create/master/MaslowCreate.png)

Maslow create breaks with the tradition of CAD programs which inherit from drawing programs and instead inherits from logical languages like programing. This allows it to be a CAD program which has language like features such as importing modules, version control, and colaboration.

# Use

A 3D model within Maslow Create is composed of interconnected nodes called Atoms and Molecules. An atom is an operation you can perform on a shape (ie translate it in space). A molecule can contain any number of atoms in a configuration (ie generate a table leg). Think of Atoms as the built in functions of a programing language and molecules as the functions you create.

You can place a new atom by right clicking anywhere within the flow canvas area and entering an atom name in the search bar.

Currently Maslow Create supports the folowing atoms:

### Assembly 

The assembly atom allows multiple shapes to be combigned into one unit called an assembly. The order in which atoms are combigned matters because where shapes intersect shapes earlier in the order subtract from shapes later in the order. For example if you have a bolt which needs to create a hole in a part you should assemble first the part and then the bolt.

![assembly](https://raw.githubusercontent.com/BarbourSmith/Maslow-Create/master/images/Assembly.PNG)

### Add BOM Tag

The Add BOM Tag atom tags a part with a bill of materials item. This item will appear in the project bill of materials one time each time the tagged part appears in the final shape. For example if you have a table leg which needs four bolts, and the final model has four table legs the bolt will automatically appear in the final bill of materials 16 times.

{picture of tag}
{picture of BOM file}

### Circle

The circle atom creates a circle shape. Circle shapes are commonly extruded to create cylinders.

![circle](https://raw.githubusercontent.com/BarbourSmith/Maslow-Create/master/images/Circle.PNG)

### Code

The code atom allows you to enter arbitrary [jsxcad](https://jsxcad.js.org/) code. Please note that parts of this interface are likely to change in the near future.

### Constant

The constant atom defines a constant number which can be used to control multiple inputs.

{picture of constant controling multiple inputs}

### Difference

The difference atom subtracts one shape from another.

![difference](https://raw.githubusercontent.com/BarbourSmith/Maslow-Create/master/images/Difference.PNG)

### Equation 

The equation Atom lets you perform basic math operations on numbers produced by constants.

{Show equation doing something}

### Extrude 

The extrude atom takes a 2D shape and makes it 3D.

![extrude](https://raw.githubusercontent.com/BarbourSmith/Maslow-Create/master/images/Extrude.PNG)

### Gcode

The gcode atom generates gcode to cut the input shape.

![Gcode1](https://github.com/BarbourSmith/Maslow-Create/blob/master/images/Gcode1.PNG)
![Gcode2](https://github.com/BarbourSmith/Maslow-Create/blob/master/images/Gcode2.PNG)

### GitHub

The GitHub atom type is not directly available. By clicking on the GitHub tab when placing a new Atom you can search for and add any other Maslow Create project to your project.

### Input

The input atom lets you define which variables are inputs to your program. They function similar to constants, however when you share your project, the person on the other end will have the ability to change the values of the inputs. Inputs placed within a molecule will add inputs to that molecule up one level.

{picture of project being shared}

### Intersection

The intersection atom computes the area of intersection of two shapes and creates a new shape out of that area.

{picture of intersection}

### Molecule

The molecule atom can contain any number of atoms in a useful configuration. To add inputs to the molecule, place an input atom within it.

{picture of molecule}

### Output

The output atom cannot be directly placed, however each molecule has one output which cannot be delted. Connect a shape to the output of a molecule to make that shape available one level up. The output of the top level molecule is the output of the project.

![output](https://raw.githubusercontent.com/BarbourSmith/Maslow-Create/master/images/Output.PNG)

### README

The README atom provides notes to the next person reading the project. The text of the readme input is added to the readme page of the project (similar to this page you are reading now).

{Show readme atom}

### Rectangle

The rectangle atom creates a rectangle shape. Rectangles are commonly extruded to make a 3D shape.

{show picture of rectangle}

### Regular Polygon

The regular polygon atom creates a regular polygon shape. Regular polygons are regularly extruded to create a 3D shape.

![regular polygon](https://raw.githubusercontent.com/BarbourSmith/Maslow-Create/master/images/RegularPolygon.PNG)

### Rotate

The rotate atom rotates a shape along any of it's three axis.

{picture of rotate}

### Scale

The scale atom scales a shape evenly in all directions.

{picture of scale}

### Shrinkwrap

The shrinkwrap atom combines multiple shapes into a single shape as if they had been shrinkwrapped. This is useful for creating shapes which would be dificult to create in other ways.

{picture of shrinkwrap}

### Stretch

The stretch atom stretches a shape along any of its axis.

{picture of stretch}

### Tag

The tag atom adds a tag to a part which can be later used to retrieve that part from an assembly.

### Translate

The translate atom moves a 3D shape in 3D space or a 2D shape in 2D space.

{picture of translate}

### Union

The union atom combines multiple shapes into a single shape.

{picture of union}


# Development

You can read the complete documentation at [https://maslowcreate.org/documentation/](https://maslowcreate.org/documentation/)

## How To Setup

1.  Clone the repo:

        git clone https://github.com/BarbourSmith/Maslow-Create.git

2.  Install dependencies:

        npm install

3.  Run webpack:

        npm start

Your canvas piece should open up automatically at http://localhost:3000 and you should see 'HTML CANVAS BOILERPLATE' on hover.

## Layout of the program

Maslow Create has three main areas of the interface. Along the top of the screen is the logical flow of the design. In the lower left is a 3D rendering of the design, and in the lower right is the side bar which displays information related to the currently selected atom. If no atom is selected, then information about the open molecule is displayed.

The logical flow of the design is composed of nodes called Atoms which are connected by connectors. Each atom has a number of attachment points where connectors can connect. Each atom type inherits from the atom class which is defined in the file `/dist/js/molecules/prototypes.js`. Each atom type then has it's own file which modifies the behavior of the default atom class.

The lower left 3D rendring is an instance of the JSCAD project. It is currently a hacked version of 1.x while waiting for version 2 to be released. Right now the generated code is done through string manipulation. In version 2 we will pass actual JS objects to functions.

The lower right corner of the screen is called the "Side Bar" It contains information about the currently selected atom. It is populated by that atom's "Generate Sidebar" function.
