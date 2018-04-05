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

Overlapper have better result on synthetic dataset than real data, and we can observe an important loss of precision between 59.6 % and 83.8 % on pacbio real dataset.

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


If isn't an internal match or an containment overlap, we store the read pairs in a set of all overlap find by one long-reads overlapper

### Overlaper

We use :

- graphmap v0.5.2 [^fn3]
- hisea 39e01e98ca [^fn4]
- mhab 1.6 and 2.1 [^fn5]
- minimap 0.2-r124 [^fn2]
- minimap2 2.10 [^fn6]

We use parametre recomand by Chu *et al.*[^fn1] and default parametre for hisea

### Venn diagram generation 

We use a python script to parse output file of each overlapper, filter overlap and generate a venn diagrame of common or not overlap.
All script and step to reproduce are avaible in this [repository](/404.html).

## Result 

### Nanopore

![venn diagram for nanopore real dataset]({{ POST_ASSETS_PATH }}/img/nanopore_venn.png)

In center we have number of overlap find by all overlapper, we call this set of overlap the core overlap. Core overlap contain 9.010.533 overlap.
Around this center we have some large set of overlap like :

|---------------------------------+-------------------+-------------------------|
| dataset composition             | number of overlap |       % of core overlap |
|:--------------------------------|------------------:|------------------------:|
| core overlap - hisea overlap    |       899.598     |     9.97 %              |
| hisea overlap $$\cap$$ mhap overlap    |       517.003     |     5.74 %              |
| core overlap - graphmap overlap |       209.040     |     2.32 %              |
| core overlap - mhap overlap     |       168.668     |     1.86 %              |
|---------------------------------+-------------------+-------------------------+

For all overlap find by mhap (11.574.382) 5.73 % of this overlap are find just by mhap1.6, for hisea this value are 1.02 % (for 10106276 overlap).

|-+-+-+-+-|
| | mhap | minimap | graphmap | hisea |
|-:|-:|-:|-:|-:|
| mhap | | 0.83 | 0.7 | 0.76 | 
| minimap | 0.83 | | 0.66 | 0.74 | 
| graphmap | 0.7 | 0.66 | | 0.74 | 
| hisea | 0.76| 0.74 | 0.74 | | 

Jacard similarity between overlaper, this matrix are triangular. 




### Pacbio

![venn diagram for pacbio real dataset]({{ POST_ASSETS_PATH }}/img/pacbio_venn.png)

For pacbio dataset core overlap contain 3.407.577 overlap. 
Other large overlap set are :

|---------------------------------+-------------------+-------------------------|
| dataset composition             | number of overlap |       % of core overlap |
|:--------------------------------|------------------:|------------------------:|
| core overlap - graphmap overlap |       713.161     |     20.92 %             |
| minimap2 overlap                |       538.118     |     15.78 %             |
| mhap overlap $$\cap$$ minimap overlap  |       503.431     |     14.76 %             |
| core overlap - hisea overlap    |       352.376     |     10.33 %             |
| mhap overlap                    |       319.744     |     9.38 %              |
|---------------------------------+-------------------+-------------------------+

For all overlap find by minimap2 (5.640.643) 9.53 % of this overlap are find just by minimap2, for mhap this value are 5.98 % (for 5336610 overlap), they share 88.21 % and 93.24 % of overlap for minimap and mhap respectivly.
Graphmap and hisea have less specific overlap.

|-+-+-+-+-|
| | mhap | minimap | graphmap | hisea |
|-:|-:|-:|-:|-:|
| mhap | | 0.87 | 0.86 | 0.83 | 
| minimap | 0.87 | | 0.95 | 0.84 | 
| graphmap | 0.86 | 0.95 | | 0.83 | 
| hisea | 0.83 | 0.84 | 0.83 | | 

Jacard similarity between overlapper


### Compare between version

At begin we use mhap 2.1 but in [^fn1] Chin. *et al* use mhap 1.6, this mistake create strange resul. The part of overlap just find by mhap 2.1 it's too large.
So we make a compare of mhap 1.6 and 2.1

![venn diagram for mhap compare]({{ POST_ASSETS_PATH }}/img/mhap_venn.png)

Jacard similarity : 0.72 and 0.26

And anothere compare between minimap and minimap2

![venn diagram for mhap compare]({{ POST_ASSETS_PATH }}/img/minimap_venn.png)

Jacard similary : 0.70 and 0.98

## Conclusion

Overlapper tools have quite similare, except on real pacbio dataset[^fn1], sensibility and precision but the set of overlap find by this tools can be very different.
mhap1.6 and minimap2 are more specific 

Actualy overlapper tools compare between use just with this sensibilty and precsion, the only method to compare the quality of finded overlap is the quality of assembly generate with this overlap.
But the overlap find by one overlapper are different than overlap find by another, even if this just 2 different version of overlaper.

In this study we just remove no overlap, we didn't add filter on length or mapping quality of overlap, and the effect of new filter is unclear for me.

The true used by Chi et al. for this dataset are based on bwa mem mapping, and in fact it's just add another overlapper on this annalysis.

The overlaper comparison based on a quantitative measurement (sensitivity, precision) is not satisfactory, two tools with the same sensitivity for a given set will detect a different overlap set, see MHAP Minimap for the nanopore set.
The only qualitative method currently used is the comparison of assembly quality, this notion is vague and given that this method uses many other parameters (quality threshold, read correction, specificity of the genome to be studied), this measurement is strongly noisy in addition to losing details.

But the importance of finding or not finding an overlap depends on your application (correction, assembly, variant detection, repeat resolution) and I think it's impossible to find a perfect measure to differentiate the overlapping in any case the measures of sensitivity, precision are not enough.

## Reference

[^fn1]: Innovations and challenges in detecting long read overlaps: an evaluation of the state-of-the-art by Chu *et al.* doi:[10.1093/bioinformatics/btw811](http://doi.org/10.1093/bioinformatics/btw811)
[^fn2]: Minimap and miniasm: fast mapping and de novo assembly for noisy long sequences by Heng Li doi:[10.1093/bioinformatics/btw152](https://doi.org/10.1093/bioinformatics/btw152)
[^fn3]: Fast and sensitive mapping of nanopore sequencing reads with GraphMap by Sovic *et al.* doi:[10.1038/ncomms11307](https://doi.org/10.1038/ncomms11307)
[^fn4]: HISEA: HIerarchical SEed Aligner for PacBio data by Khiste and Ilie doi:[10.1186/s12859-017-1953-9](https://doi.org/10.1186/s12859-017-1953-9)
[^fn5]: Assembling large genomes with single-molecule sequencing and locality-sensitive hashing Berlin *et al.* doi:[10.1038/nbt.3238](https:doi.org/10.1038/nbt.3238)
[^fn6]: Minimap2: pairwise alignment for nucleotide sequences by Li *et al.* [arxiv](https://arxiv.org/abs/1708.01492v5)
