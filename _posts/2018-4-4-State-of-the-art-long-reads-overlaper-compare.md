---
layout: default
title: State-of-the-art long reads overlaper-compare
date: 2018-04-04
---

# state-of-the-art long-read overlapping tools comparative analysis

## Introduction

In *Innovations and challenges in detecting long read overlaps: an evaluation of the state-of-the-art* by Chu *et al.*
Presente and compare five long-read overlapper, on two synthetic dataset (one pacbio, one nanopore) and two real dataset (one pacbio, one nanopore).

Overlapper have better result on synthetic dataset than real dataset and the sensibility never exced 95.2 % 

![table 2 of review](image/review_table2.png)

So ok overlapper didn't have a perfect sensibility, but does they miss the same overlap ?

## Material & Methods

### Dataset

I select the dataset real dataset used by Chu *et al.*, because the loss of sensibility are greater, so we can have better resolution if long-read overlapper didn't find same overlap.

### What is an overlap

No I didn't plan to redefine all of this notion.

Just for each overlap we check if isn't an internal match or an containment match.
We use the Algorithm 5 in *Minimap and miniasm: fast mapping and de novo assembly for noisy long sequences* by Heng Li as an inspiration to check this.

![algorithm 5 in minimap and miniasm article by Heng Li](image/minimap_ovl_filter.gif)

If isn't an internal match or an containment overlap, we store the read pairs in a set of all overlap find by long-reads overlapper

### Overlaper

We use :

- graphmap
- hisea
- mhab 1.6 and 2.1
- minimap2

We use parametre recomand by Chu *et al.* and default parametre for hisea

### Venn diagram generation 

We use a python script to parse output file of each overlapper, filter overlap and generate a venn diagrame of common or not overlap.

## Result 


## Conclusion



