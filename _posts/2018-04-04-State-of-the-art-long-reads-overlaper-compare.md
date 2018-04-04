---
layout: default
title: State-of-the-art long reads overlaper-compare
date: 2018-04-04
published: true
tags: draft overlaper benchmark
---

{% include setup %}

# state-of-the-art long-read overlapping tools comparative analysis

## Introduction

In 2017 Chu *et la.* write a review [^fn1], they present and compare 5 long-read overlapper, on 4 dataset 2 synthetic and 2 real dataset.
This paper are very cool and clear, author compare overlapper on memory peak, wall clock time, sensitivty and precision, table 2 in this paper present sensitivity and precision :

![table 2 of review]({{ POST_ASSETS_PATH }}/img/table_res_review.png)

Overlapper have better result on synthetic dataset than real data, and we can observe an important loss of coverage between 59.6 % and 83.8 % on pacbio real dataset.

So ok overlapper didn't have a perfect sensibility, but does they miss the same overlap ?

## Material & Methods

### Dataset

I select the dataset real dataset used by Chu *et al.*[^fn1], because the loss of sensibility are greater, so we can have better resolution if long-read overlapper didn't find same overlap.

### What is an overlap

No I didn't plan to redefine all of this notion.

We define 3 type of overlap acording to algorithm present in minimap publication [^fn2]

![algorithm 5 in minimap and miniasm article by Heng Li]({{ POST_ASSETS_PATH }}/img/minimap_ovl_filter.png)


Internal match :
: Overlap just have little similarity in middle of read, it's probably a little repetition present in two read

Containment :
: One of read are completly contain in other read

Classic overlap :
: All other overlap


If isn't an internal match or an containment overlap, we store the read pairs in a set of all overlap find by long-reads overlapper

### Overlaper

We use :

- graphmap v0.5.2
- hisea 39e01e98ca
- mhab 1.6 and 2.1
- minimap2 2.10

We use parametre recomand by Chu *et al.*[^fn1] and default parametre for hisea

### Venn diagram generation 

We use a python script to parse output file of each overlapper, filter overlap and generate a venn diagrame of common or not overlap.

## Result 

### Nanopore

![venn diagram for nanopore real dataset]({{ POST_ASSETS_PATH }}/img/nanopore_venn.png)

In center we have number of overlap find by all overlapper, all overlaper find 9.010.533 overlap, we call this set of overlap the core overlap.
Around this center we have some large set of overlap like,

|---------------------------------+-------------------+-+-------------------------|
| dataset composition             | number of overlap | |       % of core overlap |
|:--------------------------------|------------------:|-|------------------------:|
| core overlap - hisea overlap    |       899.598     | |     9.97 %              |
| hisea overlap $$\cap$$ mhap overlap    |       517.003     | |     5.74 %              |
| core overlap - graphmap overlap |       209.040     | |     2.32 %              |
| core overlap - mhap overlap     |       168.668     | |     1.86 %              |
|---------------------------------+-------------------+-+-------------------------+


![venn diagram for pacbio real dataset]({{ POST_ASSETS_PATH }}/img/pacbio_venn.png)

In center we have number of overlap find by all overlapper, all overlaper find 3.401.832 overlap. Around this center we have number of overlap find by all overlapper minus one if we remove one overlaper the number are less than 720.000, 10 times lower than overlap find by all overlaper.

|---------------------------------+-------------------+-+-------------------------|
| dataset composition             | number of overlap | |       % of core overlap |
|:--------------------------------|------------------:|-|------------------------:|
| core overlap - graphmap overlap |       712.187     | |     20.94 %             |
| minimap overlap                 |       532.283     | |     15.65 %             |
| mhap overlap $$\cap$$ minimap overlap  |       495.185     | |     14.56 %             |
| core overlap - hisea overlap    |       332.098     | |     9.75 %              |
|---------------------------------+-------------------+-+-------------------------+


## Conclusion


## Reference

[^fn1]: Innovations and challenges in detecting long read overlaps: an evaluation of the state-of-the-art by Chu *et al.* doi:[10.1093/bioinformatics/btw811](http://doi.org/10.1093/bioinformatics/btw811)
[^fn2]: Minimap and miniasm: fast mapping and de novo assembly for noisy long sequences by Heng Li doi:[10.1093/bioinformatics/btw152](https://doi.org/10.1093/bioinformatics/btw152)
