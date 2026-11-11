// @ts-nocheck
// @ts-nocheck
import * as fabric from 'fabric';
import { TemplateData, SelectedObjectProperties } from '../types/studio';

export function initializeFabricCanvas(
  canvasEl: HTMLCanvasElement,
  templateData: TemplateData,
  onSelectionChange: (props: SelectedObjectProperties | null) => void,
  onCanvasModified: () => void
): fabric.Canvas {
  const canvas = new fabric.Canvas(canvasEl, {
    width: 800,
    height: 1200,
    backgroundColor: '#ffffff',
    selection: true,
    preserveObjectStacking: true,
  });

  const extractProps = (obj: fabric.Object | undefined): SelectedObjectProperties | null => {
    if (!obj) return null;
    const isText = obj instanceof fabric.IText || obj instanceof fabric.Textbox;
    return {
      id: (obj as any).customId || '',
      type: obj.type || '',
      text: isText ? (obj as fabric.Textbox).text : '',
      fontSize: isText ? (obj as fabric.Textbox).fontSize : undefined,
      fontFamily: isText ? (obj as fabric.Textbox).fontFamily : undefined,
      fontWeight: isText ? (obj as fabric.Textbox).fontWeight : undefined,
      fill: typeof obj.fill === 'string' ? obj.fill : '#000000',
      textAlign: isText ? (obj as fabric.Textbox).textAlign : undefined,
      left: Math.round(obj.left || 0),
      top: Math.round(obj.top || 0),
      width: Math.round((obj.width || 0) * (obj.scaleX || 1)),
      height: Math.round((obj.height || 0) * (obj.scaleY || 1)),
      scaleX: obj.scaleX,
      scaleY: obj.scaleY,
      angle: Math.round(obj.angle || 0),
      opacity: obj.opacity !== undefined ? obj.opacity : 1,
    };
  };


  canvas.on('selection:created', (e) => {
    onSelectionChange(extractProps(e.selected?.[0]));
  });

  canvas.on('selection:updated', (e) => {
    onSelectionChange(extractProps(e.selected?.[0]));
  });

  canvas.on('selection:cleared', () => {
    onSelectionChange(null);
  });

  canvas.on('object:modified', () => {
    onSelectionChange(extractProps(canvas.getActiveObject()));
    onCanvasModified();
  });

  loadTemplateOntoCanvas(canvas, templateData);

  return canvas;
}

export function loadTemplateOntoCanvas(canvas: fabric.Canvas, data: TemplateData) {
  canvas.clear();
  canvas.setBackgroundColor(data.styling.backgroundColor || '#ffffff', canvas.renderAll.bind(canvas));

  const { id, header, content, author, media, styling } = data;

  // Add Left Logo
  if (header.leftLogoUrl) {
    fabric.Image.fromURL(
      header.leftLogoUrl,
      (img) => {
        const maxWidth = 260;
        const maxHeight = 70;
        const scale = Math.min(maxWidth / (img.width || 1), maxHeight / (img.height || 1), 1);
        img.set({
          left: 60,
          top: 35,
          scaleX: scale,
          scaleY: scale,
          cornerColor: '#2563eb',
          cornerSize: 8,
          transparentCorners: false,
        });
        (img as any).customId = 'header.leftLogo';
        canvas.add(img);
        canvas.renderAll();
      },
      { crossOrigin: 'anonymous' }
    );
  }

  // Header Divider
  if (header.showDivider) {
    const divider = new fabric.Line([400, 35, 400, 100], {
      stroke: styling.goldColor || '#D4AF37',
      strokeWidth: 2,
      selectable: false,
    });
    canvas.add(divider);
  }

  // Add Right Logo
  if (header.rightLogoUrl) {
    fabric.Image.fromURL(
      header.rightLogoUrl,
      (img) => {
        const maxWidth = 280;
        const maxHeight = 80;
        const scale = Math.min(maxWidth / (img.width || 1), maxHeight / (img.height || 1), 1);
        img.set({
          left: 470,
          top: 30,
          scaleX: scale,
          scaleY: scale,
          cornerColor: '#2563eb',
          cornerSize: 8,
          transparentCorners: false,
        });
        (img as any).customId = 'header.rightLogo';
        canvas.add(img);
        canvas.renderAll();
      },
      { crossOrigin: 'anonymous' }
    );
  }

  if (id === 'template-1') {
    // TEMPLATE 1: Luxury Gold
    // Top banner background
    const bannerBg = new fabric.Rect({
      left: 160,
      top: 145,
      width: 480,
      height: 52,
      fill: '#0c2b66',
      stroke: '#E7C769',
      strokeWidth: 2,
      rx: 4,
      ry: 4,
      selectable: true,
    });
    (bannerBg as any).customId = 'banner.bg';
    canvas.add(bannerBg);

    // Heading text
    const heading = new fabric.IText(content.heading, {
      left: 280,
      top: 153,
      fontFamily: 'Playfair Display',
      fontSize: 28,
      fontWeight: 'bold',
      fill: '#ffffff',
      selectable: true,
    });
    (heading as any).customId = 'content.heading';
    canvas.add(heading);

    // Body Text
    const bodyText = new fabric.Textbox(content.bodyText, {
      left: 70,
      top: 240,
      width: 660,
      fontSize: 17,
      lineHeight: 1.6,
      fontFamily: 'Playfair Display',
      fill: '#1e293b',
      textAlign: 'center',
      selectable: true,
    });
    (bodyText as any).customId = 'content.bodyText';
    canvas.add(bodyText);

    // Recommendation Card
    const recBox = new fabric.Rect({
      left: 70,
      top: 570,
      width: 660,
      height: 120,
      fill: '#081D45',
      stroke: '#D4AF37',
      strokeWidth: 2.5,
      rx: 16,
      ry: 16,
      selectable: true,
    });
    (recBox as any).customId = 'recommendation.box';
    canvas.add(recBox);

    const recTitle = new fabric.IText(content.recommendationTitle || 'I STRONGLY RECOMMEND', {
      left: 230,
      top: 585,
      fontFamily: 'Inter',
      fontSize: 15,
      fontWeight: 'bold',
      fill: '#ffffff',
      textAlign: 'center',
    });
    (recTitle as any).customId = 'recommendation.title';
    canvas.add(recTitle);

    const recHighlight = new fabric.IText(content.recommendationHighlight || 'DOME CASTLE', {
      left: 250,
      top: 610,
      fontFamily: 'Playfair Display',
      fontSize: 32,
      fontWeight: 'bold',
      fill: '#FFDE59',
      textAlign: 'center',
    });
    (recHighlight as any).customId = 'recommendation.highlight';
    canvas.add(recHighlight);

    const recSubtitle = new fabric.IText(
      content.recommendationSubtitle || 'to anyone looking for an excellent venue for their celebrations.',
      {
        left: 140,
        top: 655,
        fontFamily: 'Playfair Display',
        fontSize: 14,
        fontStyle: 'italic',
        fill: '#e2e8f0',
        textAlign: 'center',
      }
    );
    (recSubtitle as any).customId = 'recommendation.subtitle';
    canvas.add(recSubtitle);

    // Best wishes
    if (content.bestWishesText) {
      const bestWishes = new fabric.Textbox(content.bestWishesText, {
        left: 70,
        top: 720,
        width: 660,
        fontSize: 16,
        lineHeight: 1.5,
        fontFamily: 'Playfair Display',
        fill: '#1e293b',
        textAlign: 'center',
        selectable: true,
      });
      (bestWishes as any).customId = 'content.bestWishes';
      canvas.add(bestWishes);
    }

    // Customer Signature
    if (author.signatureUrl) {
      fabric.Image.fromURL(
        author.signatureUrl,
        (sigImg) => {
          sigImg.set({
            left: 70,
            top: 890,
            scaleX: 0.6,
            scaleY: 0.6,
            cornerColor: '#2563eb',
            cornerSize: 8,
          });
          (sigImg as any).customId = 'author.signature';
          canvas.add(sigImg);
          canvas.renderAll();
        },
        { crossOrigin: 'anonymous' }
      );
    }

    // Author Details Text
    const authorDetails = new fabric.Textbox(`${author.role}\n${author.company}`, {
      left: 70,
      top: 955,
      width: 320,
      fontSize: 16,
      lineHeight: 1.3,
      fontFamily: 'Playfair Display',
      fontWeight: 'bold',
      fill: '#0c2b66',
      selectable: true,
    });
    (authorDetails as any).customId = 'author.details';
    canvas.add(authorDetails);

    // Supporting Photo
    if (media.supportingPhotoUrl) {
      fabric.Image.fromURL(
        media.supportingPhotoUrl,
        (photoImg) => {
          photoImg.set({
            left: 420,
            top: 960,
            scaleX: 0.6,
            scaleY: 0.6,
            cornerColor: '#2563eb',
            cornerSize: 8,
          });
          (photoImg as any).customId = 'media.supportingPhoto';
          canvas.add(photoImg);
          canvas.renderAll();
        },
        { crossOrigin: 'anonymous' }
      );
    }
  } else if (id === 'template-2') {
    // TEMPLATE 2: Elegant Minimal
    // Outer Border
    const border = new fabric.Rect({
      left: 20,
      top: 20,
      width: 760,
      height: 1160,
      fill: 'transparent',
      stroke: styling.goldColor || '#CCA242',
      strokeWidth: 3,
      selectable: false,
    });
    canvas.add(border);

    // Flanked lines
    const lineLeft = new fabric.Line([120, 175, 240, 175], {
      stroke: styling.goldColor || '#CCA242',
      strokeWidth: 3,
      selectable: false,
    });
    const lineRight = new fabric.Line([560, 175, 680, 175], {
      stroke: styling.goldColor || '#CCA242',
      strokeWidth: 3,
      selectable: false,
    });
    canvas.add(lineLeft, lineRight);

    // Script Heading
    const heading = new fabric.IText(content.heading, {
      left: 290,
      top: 140,
      fontFamily: 'Great Vibes',
      fontSize: 55,
      fontWeight: 'bold',
      fill: '#122c60',
      selectable: true,
    });
    (heading as any).customId = 'content.heading';
    canvas.add(heading);

    // Quotes
    const quoteOpen = new fabric.IText('“', {
      left: 60,
      top: 240,
      fontFamily: 'Georgia',
      fontSize: 70,
      fontWeight: 'bold',
      fill: '#122c60',
      selectable: false,
    });
    canvas.add(quoteOpen);

    // Body Paragraph
    const bodyText = new fabric.Textbox(content.bodyText, {
      left: 90,
      top: 270,
      width: 620,
      fontSize: 20,
      lineHeight: 1.7,
      fontFamily: 'Montserrat',
      fill: '#122c60',
      selectable: true,
    });
    (bodyText as any).customId = 'content.bodyText';
    canvas.add(bodyText);

    // Gold dash
    const authorDash = new fabric.Line([80, 680, 130, 680], {
      stroke: styling.goldColor || '#CCA242',
      strokeWidth: 4,
      selectable: false,
    });
    canvas.add(authorDash);

    // Author
    const authorDetails = new fabric.Textbox(
      `${author.name}\n${author.company}\n${author.date}`,
      {
        left: 80,
        top: 695,
        width: 320,
        fontSize: 18,
        lineHeight: 1.4,
        fontFamily: 'Montserrat',
        fontWeight: 'bold',
        fill: '#122c60',
        selectable: true,
      }
    );
    (authorDetails as any).customId = 'author.details';
    canvas.add(authorDetails);

    // Thank you
    const thankYou = new fabric.IText(content.thankYouHeading || 'Thank you', {
      left: 310,
      top: 835,
      fontFamily: 'Great Vibes',
      fontSize: 60,
      fontWeight: 'bold',
      fill: '#122c60',
      selectable: true,
    });
    (thankYou as any).customId = 'content.thankYou';
    canvas.add(thankYou);

    const thankYouSub = new fabric.IText(
      content.thankYouSubtitle || 'for your trust and support!',
      {
        left: 260,
        top: 905,
        fontFamily: 'Montserrat',
        fontSize: 18,
        fontWeight: 'bold',
        fill: '#122c60',
        selectable: true,
      }
    );
    (thankYouSub as any).customId = 'content.thankYouSub';
    canvas.add(thankYouSub);
  } else if (id === 'template-3') {
    // TEMPLATE 3: Corporate Classic
    // Outer frame
    const border = new fabric.Rect({
      left: 20,
      top: 20,
      width: 760,
      height: 1160,
      fill: 'transparent',
      stroke: styling.goldColor || '#CF9D38',
      strokeWidth: 2.5,
      selectable: false,
    });
    canvas.add(border);

    // Watermark
    if (media.watermarkUrl) {
      fabric.Image.fromURL(
        media.watermarkUrl,
        (wmImg) => {
          wmImg.set({
            left: 450,
            top: 760,
            scaleX: 0.7,
            scaleY: 0.7,
            opacity: 0.15,
            selectable: true,
          });
          (wmImg as any).customId = 'media.watermark';
          canvas.add(wmImg);
          canvas.sendToBack(wmImg);
          canvas.renderAll();
        },
        { crossOrigin: 'anonymous' }
      );
    }

    // Heading
    const heading = new fabric.IText(content.heading, {
      left: 290,
      top: 140,
      fontFamily: 'Great Vibes',
      fontSize: 55,
      fontWeight: 'bold',
      fill: '#0e2b5d',
      selectable: true,
    });
    (heading as any).customId = 'content.heading';
    canvas.add(heading);

    if (content.subheading) {
      const subheading = new fabric.IText(content.subheading, {
        left: 140,
        top: 215,
        fontFamily: 'Inter',
        fontSize: 14,
        fontWeight: 'bold',
        fill: '#0e2b5d',
        selectable: true,
      });
      (subheading as any).customId = 'content.subheading';
      canvas.add(subheading);
    }

    // Quotation Card Box
    const quoteBox = new fabric.Rect({
      left: 60,
      top: 250,
      width: 680,
      height: 340,
      fill: '#ffffff',
      stroke: styling.goldColor || '#CF9D38',
      strokeWidth: 2.5,
      rx: 20,
      ry: 20,
      selectable: true,
    });
    (quoteBox as any).customId = 'content.quoteBox';
    canvas.add(quoteBox);

    // Body text inside box
    const bodyText = new fabric.Textbox(content.bodyText, {
      left: 90,
      top: 290,
      width: 620,
      fontSize: 19,
      lineHeight: 1.7,
      fontFamily: 'Inter',
      fill: '#0e2b5d',
      selectable: true,
    });
    (bodyText as any).customId = 'content.bodyText';
    canvas.add(bodyText);

    // Author
    const authorDash = new fabric.Line([80, 615, 130, 615], {
      stroke: styling.goldColor || '#CF9D38',
      strokeWidth: 4,
      selectable: false,
    });
    canvas.add(authorDash);

    const authorDetails = new fabric.Textbox(
      `${author.name}\n${author.company}\n${author.date}`,
      {
        left: 80,
        top: 630,
        width: 320,
        fontSize: 18,
        lineHeight: 1.4,
        fontFamily: 'Inter',
        fontWeight: 'bold',
        fill: '#0e2b5d',
        selectable: true,
      }
    );
    (authorDetails as any).customId = 'author.details';
    canvas.add(authorDetails);

    // Thank you
    const thankYou = new fabric.IText(content.thankYouHeading || 'Thank you', {
      left: 310,
      top: 755,
      fontFamily: 'Great Vibes',
      fontSize: 60,
      fontWeight: 'bold',
      fill: '#0e2b5d',
      selectable: true,
    });
    (thankYou as any).customId = 'content.thankYou';
    canvas.add(thankYou);

    const thankYouSub = new fabric.IText(
      content.thankYouSubtitle || 'for your excellent service and support!',
      {
        left: 230,
        top: 825,
        fontFamily: 'Inter',
        fontSize: 18,
        fontWeight: 'bold',
        fill: '#0e2b5d',
        selectable: true,
      }
    );
    (thankYouSub as any).customId = 'content.thankYouSub';
    canvas.add(thankYouSub);
  }

  canvas.renderAll();
}

